import React, { useEffect, useState, useMemo, useContext, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { FaPlus, FaUserPlus, FaTimes, FaFileCsv, FaTrash, FaCopy } from 'react-icons/fa';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import AuthContext from '../context/AuthContext.jsx';
import StatusSelector from '../components/ui/StatusSelector.jsx';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.jsx';
import EditLabelsModal from '../components/ui/EditLabelsModal.jsx';

function AgentDropdownMenu({ options, onSelect, onClose, targetRect, searchTerm, onSearchChange }) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const dropdownEl = dropdownRef.current;
        if (!dropdownEl || !targetRect) return;
        const { innerHeight } = window;
        const dropdownHeight = dropdownEl.offsetHeight;
        let top = targetRect.bottom + 4;
        if ((top + dropdownHeight) > innerHeight && targetRect.top > dropdownHeight) {
            top = targetRect.top - dropdownHeight - 4;
        }
        dropdownEl.style.top = `${top}px`;
        dropdownEl.style.left = `${targetRect.left}px`;
        dropdownEl.style.width = `${targetRect.width < 256 ? 256 : targetRect.width}px`;
    }, [targetRect]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return createPortal(
        <div ref={dropdownRef} className="fixed z-50 text-left">
            <div className="w-full bg-white border border-border rounded-md shadow-lg">
                <div className="p-2 border-b"><div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search names..." className="w-full bg-gray-100 p-2 pl-9 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" value={searchTerm} onChange={onSearchChange} autoFocus /></div></div>
                <ul className="max-h-48 overflow-y-auto">{options.length > 0 ? (options.map(staff => (<li key={staff.id} onClick={() => onSelect(staff.id)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-normal">{`${staff.first_name} ${staff.last_name}`.trim() || staff.username}</li>))) : (<li className="px-3 py-2 text-gray-500 font-normal">No results found.</li>)}</ul>
            </div>
        </div>,
        document.body
    );
}

export default function CurrentTickets() {
    const [tickets, setTickets] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [statusLabels, setStatusLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assigningTicket, setAssigningTicket] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [agentSearchTerm, setAgentSearchTerm] = useState("");
    const [isEditLabelsModalOpen, setIsEditLabelsModalOpen] = useState(false);
    
    const { authTokens, user } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const priorityOptions = [
        { value: 'Low', label: 'Low', colorClass: 'bg-stone-400' },
        { value: 'Medium', label: 'Medium', colorClass: 'bg-amber-500' },
        { value: 'High', label: 'High', colorClass: 'bg-red-500' },
        { value: 'Urgent', label: 'Urgent', colorClass: 'bg-red-700' },
        { value: 'Critical', label: 'Critical', colorClass: 'bg-black' },
    ];
    
    const moveOptions = ['Unassigned Tickets', 'Open Tickets', 'Waiting for Response', 'Resolved Tickets'];

    const fetchData = useCallback(async () => {
        if (!authTokens) return;
        setLoading(true);
        setError(null);

        try {
            const [ticketsRes, usersRes, statusLabelsRes] = await Promise.all([
                fetch(`${API_URL}/api/incidents/`, { headers: { 'Authorization': `Bearer ${authTokens.access}` } }),
                fetch(`${API_URL}/api/users/`, { headers: { 'Authorization': `Bearer ${authTokens.access}` } }),
                fetch(`${API_URL}/api/status-labels/`, { headers: { 'Authorization': `Bearer ${authTokens.access}` } })
            ]);

            if (ticketsRes.ok) {
                const data = await ticketsRes.json();
                setTickets(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
            } else {
                setError("Failed to load tickets.");
            }

            if (usersRes.ok) {
                const data = await usersRes.json();
                setAllEmployees(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
            }

            if (statusLabelsRes.ok) {
                const data = await statusLabelsRes.json();
                setStatusLabels(Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : []);
            }
        } catch (err) {
            setError("An error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    }, [authTokens, API_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTicketUpdate = async (ticketId, field, value) => {
        setAssigningTicket(null);
        try {
            const formData = new FormData();
            formData.append(field, value);
            
            const response = await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authTokens.access}` },
                body: formData
            });

            if (response.ok) {
                // Re-fetch all data to ensure the UI is in sync. This is the most reliable method.
                await fetchData();
            } else {
                console.error("Failed to update ticket. Backend responded with an error.");
            }
        } catch (err) {
            console.error('A client-side error occurred while updating the ticket:', err);
        }
    };
    
    const handleSelectTicket = (ticketId) => { setSelectedTickets(prev => prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]); };

    const handleBulkMove = async (groupName) => {
        setIsMoveMenuOpen(false);
        const updates = selectedTickets.map(id => {
            const formData = new FormData();
            let statusToApply;
            switch (groupName) {
                case 'Unassigned Tickets': formData.append('agent', ''); break;
                case 'Open Tickets': statusToApply = statusLabels.find(l => l.name.toLowerCase() === 'open'); break;
                case 'Waiting for Response': statusToApply = statusLabels.find(l => l.name.toLowerCase() === 'awaiting customer'); break;
                case 'Resolved Tickets': statusToApply = statusLabels.find(l => l.name.toLowerCase() === 'resolved'); break;
                default: return null;
            }
            if (statusToApply) {
                formData.append('status_id', statusToApply.id);
            } else if (groupName !== 'Unassigned Tickets') {
                return null;
            }
            return fetch(`${API_URL}/api/incidents/${id}/`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${authTokens.access}` }, body: formData });
        }).filter(Boolean);
        
        await Promise.all(updates);
        await fetchData();
        setSelectedTickets([]);
    };

    const handleExportSelected = () => {
        const ticketsToExport = tickets.filter(t => selectedTickets.includes(t.id));
        if (ticketsToExport.length === 0) return;
        const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Employee', 'Agent'];
        const rows = ticketsToExport.map(ticket => {
            const agentName = allEmployees.find(staff => staff.id === ticket.agent?.id)?.username || 'Unassigned';
            const title = `"${ticket.title.replace(/"/g, '""')}"`;
            return [ticket.id, title, ticket.status?.name, ticket.priority, ticket.category, ticket.requester_name, agentName].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "notifiq_tickets.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSelectedTickets([]);
    };

    const handleDuplicateSelected = async () => {
        const duplicatePromises = selectedTickets.map(id => fetch(`${API_URL}/api/incidents/${id}/duplicate/`, { method: 'POST', headers: { 'Authorization': `Bearer ${authTokens.access}` } }));
        await Promise.all(duplicatePromises);
        await fetchData();
        setSelectedTickets([]);
    };

    const handleDeleteSelected = async () => {
        setIsConfirmingDelete(false);
        const deletePromises = selectedTickets.map(id => fetch(`${API_URL}/api/incidents/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authTokens.access}` } }));
        await Promise.all(deletePromises);
        await fetchData();
        setSelectedTickets([]);
    };

    const handleLabelCreate = async (labelData) => { await fetch(`${API_URL}/api/status-labels/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authTokens.access}` }, body: JSON.stringify(labelData) }); fetchData(); };
    const handleLabelUpdate = async (labelId, labelData) => { await fetch(`${API_URL}/api/status-labels/${labelId}/`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authTokens.access}` }, body: JSON.stringify(labelData) }); fetchData(); };
    const handleLabelDelete = async (labelId) => { if (window.confirm("Are you sure? This will remove the label from all tickets.")) { await fetch(`${API_URL}/api/status-labels/${labelId}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authTokens.access}` } }); fetchData(); } };
    
    
    const allTicketGroups = useMemo(() => {
        const groups = { 'Unassigned Tickets': [], 'Open Tickets': [], 'Waiting for Response': [], 'Resolved Tickets': [] };
        if (Array.isArray(tickets)) {
            tickets.forEach(ticket => {
                const statusName = ticket.status?.name?.toLowerCase();
                if (!ticket.agent) { groups['Unassigned Tickets'].push(ticket); } 
                else if (statusName === 'awaiting customer') { groups['Waiting for Response'].push(ticket); } 
                else if (statusName === 'resolved' || statusName === 'closed') { groups['Resolved Tickets'].push(ticket); } 
                else { groups['Open Tickets'].push(ticket); }
            });
        }
        return groups;
    }, [tickets]);

    const itStaff = useMemo(() => {
        return allEmployees.filter(emp => {
            const hasITGroup = emp.groups?.some(group => {
                return typeof group === 'object' && group !== null && group.name === 'IT Staff';
            });
            return hasITGroup || emp.is_superuser;
        });
    }, [allEmployees]);
    
    const filteredStaff = itStaff.filter(staff => {
        const fullName = `${staff.first_name} ${staff.last_name}`.trim().toLowerCase();
        return fullName.includes(agentSearchTerm.toLowerCase()) || staff.username.toLowerCase().includes(agentSearchTerm.toLowerCase());
    });
    
    const isITStaff = user?.groups?.includes('IT Staff') || user?.is_superuser;

    const getAgentInitials = (agentData) => {
        const agentId = (typeof agentData === 'object' && agentData !== null) ? agentData.id : agentData;
        if (!agentId) return <FaUserPlus />;
        const agent = allEmployees.find(emp => emp.id === agentId);
        if (!agent) return <FaUserPlus />;
    
        const firstInitial = agent.first_name ? agent.first_name[0] : '';
        const lastInitial = agent.last_name ? agent.last_name[0] : '';
    
        if (firstInitial && lastInitial) {
            return `${firstInitial}${lastInitial}`.toUpperCase();
        }
        return (agent.username?.substring(0, 2) || 'NA').toUpperCase();
    };

    if (loading) return <p className="p-4 text-text-secondary">Loading tickets...</p>;
    if (error) return <p className="p-4 text-red-500">{error}</p>;

    return (
        <div className="space-y-8">
            <ConfirmationDialog open={isConfirmingDelete} onClose={() => setIsConfirmingDelete(false)} onConfirm={handleDeleteSelected} title="Delete Tickets">
                Are you sure you want to delete {selectedTickets.length} selected ticket(s)? This action cannot be undone.
            </ConfirmationDialog>
            <datalist id="employee-list">
                {allEmployees.map(employee => (<option key={employee.id} value={`${employee.first_name} ${employee.last_name}`.trim() || employee.username} />))}
            </datalist>
            <EditLabelsModal open={isEditLabelsModalOpen} onClose={() => setIsEditLabelsModalOpen(false)} labels={statusLabels} onCreate={handleLabelCreate} onUpdate={handleLabelUpdate} onDelete={handleLabelDelete} />
            
            {assigningTicket && (<AgentDropdownMenu options={filteredStaff} onSelect={(agentId) => handleTicketUpdate(assigningTicket.id, 'agent', agentId)} onClose={() => setAssigningTicket(null)} targetRect={assigningTicket.rect} searchTerm={agentSearchTerm} onSearchChange={(e) => setAgentSearchTerm(e.target.value)}/>)}

            <header><h1 className="text-3xl font-bold text-text-primary">{isITStaff ? 'All Tickets' : 'My Tickets'}</h1></header>

            {Object.entries(allTicketGroups).map(([groupName, groupTickets]) => (
                <div key={groupName}>
                    <h2 className={`text-sm font-bold mb-2 uppercase tracking-wider ${ groupName === 'Unassigned Tickets' ? 'text-red-600' : groupName === 'Open Tickets' ? 'text-blue-600' : groupName === 'Waiting for Response' ? 'text-purple-600' : 'text-green-600' }`}>{groupName} ({groupTickets.length})</h2>
                    <div className="bg-foreground rounded-lg border border-border shadow-sm text-sm">
                        <div className="overflow-x-auto">
                            <div className="min-w-[1200px]">
                                <div className="grid grid-cols-[auto_3fr_2fr_1fr_1.5fr_1.5fr_1fr_1.5fr] text-xs font-semibold text-text-secondary border-b border-border">
                                    <div className="p-2 pl-4 w-12"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" onChange={(e) => { if (e.target.checked) { setSelectedTickets(prev => [...new Set([...prev, ...groupTickets.map(t => t.id)])]); } else { setSelectedTickets(prev => prev.filter(id => !groupTickets.some(t => t.id === id))); } }}/></div>
                                    <div className="p-2 border-l border-border">Ticket</div>
                                    <div className="p-2 border-l border-border">Employee</div>
                                    <div className="p-2 border-l border-border text-center">Agent</div>
                                    <div className="p-2 border-l border-border">Status</div>
                                    <div className="p-2 border-l border-border">Priority</div>
                                    <div className="p-2 border-l border-border">Category</div>
                                    <div className="p-2 border-l border-border">Creation Date</div>
                                </div>
                                <div>
                                    {groupTickets.map(ticket => {
                                        const agentInfo = allEmployees.find(staff => staff.id === ticket.agent?.id);
                                        const statusAsOptions = statusLabels.map(s => ({ value: s.id, label: s.name, color: s.color }));
                                        return (
                                            <div key={ticket.id} className="grid grid-cols-[auto_3fr_2fr_1fr_1.5fr_1.5fr_1fr_1.5fr] items-center border-t border-border hover:bg-gray-50/50">
                                                <div className="p-2 pl-4 text-center"><input type="checkbox" checked={selectedTickets.includes(ticket.id)} onChange={() => handleSelectTicket(ticket.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" /></div>
                                                <div className="p-2 border-l border-border font-medium text-text-primary"><Link to={`/tickets/${ticket.id}`} className="hover:underline">{ticket.title}</Link></div>
                                                <div className="p-2 border-l border-border"><input type="text" defaultValue={ticket.requester_name} onBlur={(e) => handleTicketUpdate(ticket.id, 'requester_name', e.target.value)} className="w-full bg-transparent p-1 -ml-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter or search employee" list="employee-list"/></div>
                                                <div className="p-2 border-l border-border flex items-center justify-center"><button onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setAssigningTicket({ id: ticket.id, rect: rect }); setAgentSearchTerm(""); }} className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-white transition-colors" title={agentInfo ? `${agentInfo.first_name} ${agentInfo.last_name}`.trim() || agentInfo.username : "Assign Agent"}>
                                                    {getAgentInitials(ticket.agent)}</button>
                                                </div>
                                                <div className="p-2 border-l border-border"><StatusSelector options={statusAsOptions} value={ticket.status?.id} onChange={(newValue) => handleTicketUpdate(ticket.id, 'status_id', newValue)} onEditLabels={() => setIsEditLabelsModalOpen(true)} /></div>
                                                <div className="p-2 border-l border-border"><StatusSelector options={priorityOptions} value={ticket.priority} onChange={(newValue) => handleTicketUpdate(ticket.id, 'priority', newValue)} /></div>
                                                <div className="p-2 border-l border-border text-text-secondary">{ticket.category}</div>
                                                <div className="p-2 border-l border-border text-text-secondary">{new Date(ticket.submitted_at).toLocaleDateString()}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-border p-2 pl-4 md:pl-12"><Link to="/tickets/create" className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm"><FaPlus size={12} /> Add Ticket</Link></div>
                    </div>
                </div>
            ))}
            {selectedTickets.length > 0 && ( <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white p-2 rounded-lg shadow-2xl flex items-center gap-4 z-40 text-sm">
                <span className="font-bold px-2">{selectedTickets.length} selected</span>
                <div className="h-6 w-px bg-gray-600"></div>
                <button onClick={handleDuplicateSelected} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md"><FaCopy /> Duplicate</button>
                <button onClick={handleExportSelected} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md"><FaFileCsv /> Export CSV</button>
                <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center gap-2 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-md"><FaTrash /> Delete</button>
                <div className="relative">
                    <button onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md">Move to <FiChevronDown /></button>
                    {isMoveMenuOpen && ( <div className="absolute bottom-full mb-2 w-48 bg-white text-gray-800 border border-border rounded-md shadow-lg z-50"><ul>{moveOptions.map(opt => (<li key={opt} onClick={() => { handleBulkMove(opt); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{opt}</li>))}</ul></div> )}
                </div>
                <div className="h-6 w-px bg-gray-600"></div>
                <button onClick={() => setSelectedTickets([])} className="hover:bg-gray-700 p-2 rounded-full"><FaTimes /></button>
            </div>)}
        </div>
    );
}
