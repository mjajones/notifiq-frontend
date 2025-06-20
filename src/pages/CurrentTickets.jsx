import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaUserPlus, FaTimes, FaFileCsv, FaTrash, FaCopy } from 'react-icons/fa';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
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
    const [agentSearchTerm, setAgentSearchTerm] = useState(""); // State for the search input
    
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
                setItStaff(Array.isArray(usersData.results) ? usersData.results : (Array.isArray(usersData) ? usersData : []));
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
    const handleBulkStatusChange = async (newStatus) => { /* ... */ };
    const handleExportSelected = () => { /* ... */ };
    const handleDuplicateSelected = async () => { /* ... */ };
    const handleDeleteSelected = async () => { /* ... */ };
    
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

    // Filter staff based on the search term
    const filteredStaff = itStaff.filter(staff => {
        const fullName = `${staff.first_name} ${staff.last_name}`.toLowerCase();
        return fullName.includes(agentSearchTerm.toLowerCase()) || staff.username.toLowerCase().includes(agentSearchTerm.toLowerCase());
    });
    
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
                        <div className="hidden md:grid grid-cols-[auto_3fr_2fr_1fr_1.5fr_1.5fr_1fr_1.5fr] text-xs font-semibold text-text-secondary border-b border-border">
                            {/* ... headers ... */}
                        </div>
                        <div>
                            {groupTickets.map(ticket => {
                                const agentInfo = itStaff.find(staff => staff.id === ticket.agent);
                                return (
                                    <div key={ticket.id} className="border-t border-border">
                                        {/* --- Desktop View --- */}
                                        <div className="hidden md:grid grid-cols-[auto_3fr_2fr_1fr_1.5fr_1.5fr_1fr_1.5fr] items-center hover:bg-gray-50/50">
                                            {/* ... checkbox, title, employee inputs ... */}
                                            <div className="p-2 border-l border-border flex items-center justify-center relative">
                                                <button 
                                                  onClick={() => {
                                                      setAssigningTicketId(assigningTicketId === ticket.id ? null : ticket.id);
                                                      setAgentSearchTerm(""); // Reset search on open/close
                                                  }} 
                                                  className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-white transition-colors" 
                                                  title={agentInfo ? `${agentInfo.first_name} ${agentInfo.last_name}`.trim() || agentInfo.username : "Assign Agent"}
                                                >
                                                  {agentInfo ? (agentInfo.first_name?.[0] || agentInfo.username[0]).toUpperCase() : <FaUserPlus />}
                                                </button>
                                                
                                                {/* --- NEW: Searchable Dropdown --- */}
                                                {assigningTicketId === ticket.id && (
                                                    <div className="absolute top-full mt-2 w-64 bg-white border border-border rounded-md shadow-lg z-20 text-left">
                                                        <div className="p-2 border-b">
                                                            <div className="relative">
                                                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search names..."
                                                                    className="w-full bg-gray-100 p-2 pl-9 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                                    value={agentSearchTerm}
                                                                    onChange={(e) => setAgentSearchTerm(e.target.value)}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        </div>
                                                        <ul className="max-h-48 overflow-y-auto">
                                                            {filteredStaff.length > 0 ? (
                                                                filteredStaff.map(staff => (
                                                                    <li key={staff.id} onClick={() => handleTicketUpdate(ticket.id, 'agent', staff.id)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer font-normal">
                                                                        {`${staff.first_name} ${staff.last_name}`.trim() || staff.username}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="px-3 py-2 text-gray-500 font-normal">No results found.</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                            {/* ... rest of the row ... */}
                                        </div>
                                        {/* --- Mobile View --- */}
                                        {/* ... existing mobile card view ... */}
                                    </div>
                                );
                            })}
                        </div>
                        {/* ... add ticket link ... */}
                    </div>
                </div>
            ))}

            {/* ... floating bulk action bar ... */}
        </div>
    );
}