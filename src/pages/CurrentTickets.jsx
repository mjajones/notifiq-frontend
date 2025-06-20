import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaUserPlus, FaTimes, FaFileCsv, FaTrash, FaCopy } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';
import AuthContext from '../context/AuthContext.jsx';
import StatusSelector from '../components/ui/StatusSelector.jsx';
import ConfirmationDialog from '../components/ui/ConfirmationDialog.jsx';

const statusOptions = [
    { value: 'New', label: 'New', colorClass: 'bg-gray-400' },
    { value: 'Open', label: 'Open', colorClass: 'bg-blue-400' },
    { value: 'In Progress', label: 'In Progress', colorClass: 'bg-indigo-500' },
    { value: 'Awaiting customer', label: 'Awaiting customer', colorClass: 'bg-purple-500' },
    { value: 'New reply', label: 'New reply', colorClass: 'bg-cyan-500' },
    { value: 'Resolved', label: 'Resolved', colorClass: 'bg-green-500' },
];

const priorityOptions = [
    { value: 'Low', label: 'Low', colorClass: 'bg-stone-400' },
    { value: 'Medium', label: 'Medium', colorClass: 'bg-amber-500' },
    { value: 'High', label: 'High', colorClass: 'bg-red-500' },
    { value: 'Urgent', label: 'Urgent', colorClass: 'bg-red-700' },
    { value: 'Critical', label: 'Critical', colorClass: 'bg-black' },
];

export default function CurrentTickets() {
    const [tickets, setTickets] = useState([]);
    const [itStaff, setItStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assigningTicketId, setAssigningTicketId] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    
    const { authTokens, user } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const fetchTickets = useCallback(async () => {
        if (!authTokens) return;
        try {
            const response = await fetch(`${API_URL}/api/incidents/`, { headers: { 'Authorization': `Bearer ${authTokens.access}` } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setTickets(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []));
        } catch (err) { setError(err.message); }
    }, [authTokens, API_URL]);
    
    useEffect(() => {
        if (isUpdating) return;
        setLoading(true);
        const initialLoad = async () => {
            await fetchTickets();
            try {
                const usersResponse = await fetch(`${API_URL}/api/users/`, { headers: { 'Authorization': `Bearer ${authTokens.access}` } });
                if (!usersResponse.ok) throw new Error(`HTTP ${usersResponse.status} fetching users`);
                const usersData = await usersResponse.json();
                setItStaff(Array.isArray(usersData.results) ? usersData.results : []);
            } catch (err) { console.error("Failed to fetch users", err); } 
            finally { setLoading(false); }
        };
        initialLoad();
    }, [fetchTickets, authTokens, isUpdating]);

    const handleTicketUpdate = async (ticketId, field, value) => {
        setIsUpdating(true);
        setAssigningTicketId(null);
        try {
            const formData = new FormData();
            formData.append(field, value);
            if (field === 'agent' && value) formData.append('status', 'Open');
            await fetch(`${API_URL}/api/incidents/${ticketId}/`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${authTokens.access}` }, body: formData });
            await fetchTickets();
        } catch (err) { console.error('Failed to update ticket:', err); } 
        finally { setIsUpdating(false); }
    };
    
    const handleSelectTicket = (ticketId) => { setSelectedTickets(prev => prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]); };

    const handleBulkStatusChange = async (newStatus) => {
        setIsUpdating(true);
        const updates = selectedTickets.map(id => {
            const formData = new FormData();
            formData.append('status', newStatus);
            return fetch(`${API_URL}/api/incidents/${id}/`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${authTokens.access}` }, body: formData });
        });
        await Promise.all(updates);
        await fetchTickets();
        setSelectedTickets([]);
        setIsUpdating(false);
    };

    const handleExportSelected = () => {
        const ticketsToExport = tickets.filter(t => selectedTickets.includes(t.id));
        if (ticketsToExport.length === 0) return;
        const headers = ['ID', 'Title', 'Status', 'Priority', 'Category', 'Employee', 'Agent'];
        const rows = ticketsToExport.map(ticket => {
            const agentName = itStaff.find(staff => staff.id === ticket.agent)?.username || 'Unassigned';
            const title = `"${ticket.title.replace(/"/g, '""')}"`;
            return [ticket.id, title, ticket.status, ticket.priority, ticket.category, ticket.requester_name, agentName].join(',');
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
        setIsUpdating(true);
        const duplicatePromises = selectedTickets.map(id =>
            fetch(`${API_URL}/api/incidents/${id}/duplicate/`, { method: 'POST', headers: { 'Authorization': `Bearer ${authTokens.access}` } })
        );
        try {
            await Promise.all(duplicatePromises);
        } catch (err) { console.error("Failed to duplicate tickets:", err); } 
        finally {
            await fetchTickets();
            setSelectedTickets([]);
            setIsUpdating(false);
        }
    };

    const handleDeleteSelected = async () => {
        setIsConfirmingDelete(false);
        setIsUpdating(true);
        const deletePromises = selectedTickets.map(id =>
            fetch(`${API_URL}/api/incidents/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authTokens.access}` } })
        );
        try {
            await Promise.all(deletePromises);
        } catch (err) { console.error("Failed to delete tickets:", err); } 
        finally {
            await fetchTickets();
            setSelectedTickets([]);
            setIsUpdating(false);
        }
    };
    
    const allTicketGroups = useMemo(() => {
        const groups = { 'Unassigned Tickets': [], 'Open Tickets': [], 'Waiting for Response': [], 'Resolved Tickets': [] };
        tickets.forEach(ticket => {
            const status = (ticket.status || 'New').toLowerCase();
            if (!ticket.agent) groups['Unassigned Tickets'].push(ticket);
            else if (['open', 'new', 'in progress', 'new reply'].includes(status)) groups['Open Tickets'].push(ticket);
            else if (status === 'awaiting customer') groups['Waiting for Response'].push(ticket);
            else if (status === 'resolved') groups['Resolved Tickets'].push(ticket);
        });
        return groups;
    }, [tickets]);
    
    const isITStaff = user?.groups?.includes('IT Staff') || user?.is_superuser;

    if (loading) return <p className="p-4 text-text-secondary">Loading tickets...</p>;
    if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

    return (
        <div className="space-y-8">
            <ConfirmationDialog open={isConfirmingDelete} onClose={() => setIsConfirmingDelete(false)} onConfirm={handleDeleteSelected} title="Delete Tickets">
                Are you sure you want to delete {selectedTickets.length} selected ticket(s)? This action cannot be undone.
            </ConfirmationDialog>

            <header>
                <h1 className="text-3xl font-bold text-text-primary">{isITStaff ? 'All Tickets' : 'My Tickets'}</h1>
            </header>

            {Object.entries(allTicketGroups).map(([groupName, groupTickets]) => (
                <div key={groupName}>
                    <h2 className={`text-sm font-bold mb-2 uppercase tracking-wider ${groupName === 'Unassigned Tickets' ? 'text-red-600' : groupName === 'Open Tickets' ? 'text-blue-600' : 'text-purple-600'}`}>{groupName} ({groupTickets.length})</h2>
                    <div className="bg-foreground rounded-lg border border-border shadow-sm text-sm">
                        
                        <div className="hidden md:grid grid-cols-[auto_3fr_2fr_1fr_1.5fr_1fr_1.5fr] text-xs font-semibold text-text-secondary border-b border-border">
                            <div className="p-2 pl-4 w-12"></div>
                            <div className="p-2 border-l border-border">Ticket</div>
                            <div className="p-2 border-l border-border">Employee</div>
                            <div className="p-2 border-l border-border text-center">Agent</div>
                            <div className="p-2 border-l border-border">Status</div>
                            <div className="p-2 border-l border-border">Category</div>
                            <div className="p-2 border-l border-border">Creation Date</div>
                        </div>

                        <div>
                            {groupTickets.map(ticket => {
                                const agentInfo = itStaff.find(staff => staff.id === ticket.agent);
                                return (
                                    <div key={ticket.id} className="border-t border-border">
                                        {/* Desktop View */}
                                        <div className="hidden md:grid grid-cols-[auto_3fr_2fr_1fr_1.5fr_1fr_1.5fr] items-center hover:bg-gray-50/50">
                                            <div className="p-2 pl-4 text-center"><input type="checkbox" checked={selectedTickets.includes(ticket.id)} onChange={() => handleSelectTicket(ticket.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" /></div>
                                            <div className="p-2 border-l border-border font-medium text-text-primary"><Link to={`/tickets/${ticket.id}`} className="hover:underline">{ticket.title}</Link></div>
                                            <div className="p-2 border-l border-border"><input type="text" defaultValue={ticket.requester_name} onBlur={(e) => handleTicketUpdate(ticket.id, 'requester_name', e.target.value)} className="w-full bg-transparent p-1 -ml-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter employee name"/></div>
                                            <div className="p-2 border-l border-border flex items-center justify-center relative">
                                                <button onClick={() => setAssigningTicketId(assigningTicketId === ticket.id ? null : ticket.id)} className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-white transition-colors" title={agentInfo ? `${agentInfo.first_name} ${agentInfo.last_name}`.trim() || agentInfo.username : "Assign Agent"}>
                                                  {agentInfo ? (agentInfo.first_name?.[0] || agentInfo.username[0]).toUpperCase() : <FaUserPlus />}
                                                </button>
                                                {assigningTicketId === ticket.id && ( <div className="absolute top-full mt-2 w-48 bg-white border border-border rounded-md shadow-lg z-20"><ul>{itStaff.map(staff => (<li key={staff.id} onClick={() => handleTicketUpdate(ticket.id, 'agent', staff.id)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{`${staff.first_name} ${staff.last_name}`.trim() || staff.username}</li>))}</ul></div> )}
                                            </div>
                                            <div className="p-2 border-l border-border"><StatusSelector options={statusOptions} value={ticket.status} onChange={(newValue) => handleTicketUpdate(ticket.id, 'status', newValue)} /></div>
                                            <div className="p-2 border-l border-border text-text-secondary">{ticket.category}</div>
                                            <div className="p-2 border-l border-border text-text-secondary">{new Date(ticket.submitted_at).toLocaleDateString()}</div>
                                        </div>
                                        {/* Mobile Card View */}
                                        <div className="md:hidden p-3 flex gap-3"><input type="checkbox" checked={selectedTickets.includes(ticket.id)} onChange={() => handleSelectTicket(ticket.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1" />
                                            <div className="space-y-2 flex-1">
                                                <Link to={`/tickets/${ticket.id}`} className="font-bold text-text-primary hover:underline">{ticket.title}</Link>
                                                <div className="text-sm"><span className="text-text-secondary">For: </span><span className="font-medium text-text-primary">{ticket.requester_name}</span></div>
                                                <div className="text-xs text-text-secondary">Category: {ticket.category || 'N/A'} &bull; Created: {new Date(ticket.submitted_at).toLocaleDateString()}</div>
                                                <div className="flex flex-wrap gap-4 items-center pt-2">
                                                    <div className="flex-1 min-w-[120px]"><StatusSelector options={statusOptions} value={ticket.status} onChange={(newValue) => handleTicketUpdate(ticket.id, 'status', newValue)} /></div>
                                                    <div className="flex-1 min-w-[120px]"><StatusSelector options={priorityOptions} value={ticket.priority} onChange={(newValue) => handleTicketUpdate(ticket.id, 'priority', newValue)} /></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                         <div className="border-t border-border p-2 pl-4 md:pl-12">
                            <Link to="/tickets/create" className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm"><FaPlus size={12} /> Add Ticket</Link>
                        </div>
                    </div>
                </div>
            ))}

            {selectedTickets.length > 0 && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white p-2 rounded-lg shadow-2xl flex items-center gap-4 z-40 text-sm">
                    <span className="font-bold px-2">{selectedTickets.length} selected</span>
                    <div className="h-6 w-px bg-gray-600"></div>
                    <button onClick={handleDuplicateSelected} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md"><FaCopy /> Duplicate</button>
                    <button onClick={handleExportSelected} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md"><FaFileCsv /> Export CSV</button>
                    <button onClick={() => setIsConfirmingDelete(true)} className="flex items-center gap-2 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-md"><FaTrash /> Delete</button>
                    <div className="relative">
                        <button onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)} className="flex items-center gap-2 hover:bg-gray-700 p-2 rounded-md">Move to <FiChevronDown /></button>
                        {isMoveMenuOpen && ( <div className="absolute bottom-full mb-2 w-48 bg-white text-gray-800 border border-border rounded-md shadow-lg z-50"><ul>{statusOptions.map(opt => (<li key={opt.value} onClick={() => { handleBulkStatusChange(opt.value); setIsMoveMenuOpen(false); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{opt.label}</li>))}</ul></div> )}
                    </div>
                    <div className="h-6 w-px bg-gray-600"></div>
                    <button onClick={() => setSelectedTickets([])} className="hover:bg-gray-700 p-2 rounded-full"><FaTimes /></button>
                </div>
            )}
        </div>
    );
}