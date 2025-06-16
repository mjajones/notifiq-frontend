import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaUserPlus } from 'react-icons/fa';
import AuthContext from '../context/AuthContext.jsx';
import StatusSelector from '../components/ui/StatusSelector.jsx';

// --- Configuration for Status and Priority Dropdowns ---
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
    const [assigningTicketId, setAssigningTicketId] = useState(null); // State to track which agent dropdown is open
    const { authTokens } = useContext(AuthContext);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchData = async () => {
            if (!authTokens) {
                setLoading(false);
                return;
            }
            try {
                // Fetch both tickets and users at the same time for efficiency
                const [ticketsResponse, usersResponse] = await Promise.all([
                    fetch(`${API_URL}/api/incidents/`, {
                        headers: { 'Authorization': `Bearer ${authTokens.access}` }
                    }),
                    fetch(`${API_URL}/api/users/`, {
                        headers: { 'Authorization': `Bearer ${authTokens.access}` }
                    })
                ]);

                if (!ticketsResponse.ok) throw new Error(`HTTP ${ticketsResponse.status} fetching tickets`);
                if (!usersResponse.ok) throw new Error(`HTTP ${usersResponse.status} fetching users`);
                
                const ticketsData = await ticketsResponse.json();
                const usersData = await usersResponse.json();

                setTickets(Array.isArray(ticketsData.results) ? ticketsData.results : (Array.isArray(ticketsData) ? ticketsData : []));
                setItStaff(Array.isArray(usersData.results) ? usersData.results : (Array.isArray(usersData) ? usersData : []));

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authTokens]);

    const handleTicketUpdate = async (ticketId, field, value) => {
        const originalTickets = [...tickets];
        const updatedTickets = tickets.map(t =>
            t.id === ticketId ? { ...t, [field]: value } : t
        );
        setTickets(updatedTickets);
        setAssigningTicketId(null); // Close the assignment dropdown after selection

        try {
            await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                },
                body: JSON.stringify({ [field]: value }),
            });
        } catch (err) {
            console.error('Failed to update ticket:', err);
            setTickets(originalTickets); // Revert on failure
        }
    };

    const allTicketGroups = useMemo(() => {
        const groups = {
            'Unassigned Tickets': [],
            'Open Tickets': [],
            'Waiting for Response': [],
            'Resolved Tickets': [],
        };
        
        tickets.forEach(ticket => {
            const status = (ticket.status || 'New').toLowerCase();
            if (!ticket.agent) {
                groups['Unassigned Tickets'].push(ticket);
            } else if (status === 'open' || status === 'new' || status === 'in progress' || status === 'new reply') {
                groups['Open Tickets'].push(ticket);
            } else if (status === 'awaiting customer') {
                groups['Waiting for Response'].push(ticket);
            } else if (status === 'resolved') {
                groups['Resolved Tickets'].push(ticket);
            }
        });

        return groups; // Return all groups, even if they are empty
    }, [tickets]);

    if (loading) return <p className="p-8 text-text-secondary">Loading tickets...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

    return (
        <div className="flex-1 p-6 md:p-8 space-y-8">
            <header className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary">All Tickets</h1>
                {/* Other controls can be added here */}
            </header>

            {Object.entries(allTicketGroups).map(([groupName, groupTickets]) => (
                <div key={groupName}>
                    <h2 className="text-sm font-bold text-violet-600 mb-2 uppercase tracking-wider">{groupName} ({groupTickets.length})</h2>
                    <div className="bg-foreground rounded-lg border border-border shadow-sm text-sm">
                        <div className="grid grid-cols-[auto_3fr_1fr_1.5fr_1.5fr_2fr] text-xs font-semibold text-text-secondary border-b border-border">
                            <div className="p-2 pl-4 w-12"></div>
                            <div className="p-2 border-l border-border">Ticket</div>
                            <div className="p-2 border-l border-border text-center">Agent</div>
                            <div className="p-2 border-l border-border">Status</div>
                            <div className="p-2 border-l border-border">Priority</div>
                            <div className="p-2 border-l border-border">Creation Date</div>
                        </div>
                        {groupTickets.length > 0 ? groupTickets.map(ticket => {
                            const agentInfo = itStaff.find(staff => staff.id === ticket.agent);
                            return (
                                <div key={ticket.id} className="grid grid-cols-[auto_3fr_1fr_1.5fr_1.5fr_2fr] items-center border-t border-border hover:bg-gray-50/50">
                                    <div className="p-2 pl-4 text-center">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    </div>
                                    <div className="p-2 border-l border-border font-medium text-text-primary">{ticket.title}</div>
                                    <div className="p-2 border-l border-border flex items-center justify-center relative">
                                        <button 
                                          onClick={() => setAssigningTicketId(assigningTicketId === ticket.id ? null : ticket.id)}
                                          className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                                          title={agentInfo ? `${agentInfo.first_name} ${agentInfo.last_name}`.trim() || agentInfo.username : "Assign Agent"}
                                        >
                                          {agentInfo ? (agentInfo.first_name?.[0] || agentInfo.username[0]).toUpperCase() : <FaUserPlus />}
                                        </button>
                                        {assigningTicketId === ticket.id && (
                                            <div className="absolute top-full mt-2 w-48 bg-white border border-border rounded-md shadow-lg z-20">
                                                <ul>
                                                    {itStaff.map(staff => (
                                                        <li 
                                                          key={staff.id} 
                                                          onClick={() => handleTicketUpdate(ticket.id, 'agent', staff.id)}
                                                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            {`${staff.first_name} ${staff.last_name}`.trim() || staff.username}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 border-l border-border">
                                        <StatusSelector options={statusOptions} value={ticket.status} onChange={(newValue) => handleTicketUpdate(ticket.id, 'status', newValue)} />
                                    </div>
                                    <div className="p-2 border-l border-border">
                                        <StatusSelector options={priorityOptions} value={ticket.priority} onChange={(newValue) => handleTicketUpdate(ticket.id, 'priority', newValue)} />
                                    </div>
                                    <div className="p-2 border-l border-border text-text-secondary">
                                        {new Date(ticket.submitted_at).toLocaleDateString()}
                                    </div>
                                </div>
                            )
                        }) : null}
                         <div className="border-t border-border p-2 pl-12">
                            <Link to="/tickets/create" className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm">
                                <FaPlus size={12} /> Add Ticket
                            </Link>
                        </div>
                    </div>
                </div>
            )) : <p className="text-text-secondary">No tickets to display.</p>}
        </div>
    );
}