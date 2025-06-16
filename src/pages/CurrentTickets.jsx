// src/pages/CurrentTickets.jsx

import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaUserPlus } from 'react-icons/fa';
import AuthContext from '../context/AuthContext.jsx';
import StatusSelector from '../components/ui/StatusSelector.jsx';

// --- Configuration for Dropdowns ---
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
    const { authTokens, user } = useContext(AuthContext);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // --- FIX: Create a memoized fetch function that can be reused ---
    const fetchTickets = useCallback(async () => {
        if (!authTokens) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/incidents/`, {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setTickets(Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []));
        } catch (err) {
            setError(err.message);
        }
    }, [authTokens, API_URL]);
    
    useEffect(() => {
        const initialLoad = async () => {
            setLoading(true);
            await fetchTickets();
            // Also fetch users for the assignment dropdown
            try {
                const usersResponse = await fetch(`${API_URL}/api/users/`, {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (!usersResponse.ok) throw new Error(`HTTP ${usersResponse.status} fetching users`);
                const usersData = await usersResponse.json();
                setItStaff(Array.isArray(usersData.results) ? usersData.results : (Array.isArray(usersData) ? usersData : []));
            } catch (err) {
                console.error("Failed to fetch users for assignment", err);
            } finally {
                setLoading(false);
            }
        };
        initialLoad();
    }, [fetchTickets]);

    const handleTicketUpdate = async (ticketId, field, value) => {
        setAssigningTicketId(null); // Close the assignment dropdown
        try {
            const response = await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`
                },
                body: JSON.stringify({ [field]: value }),
            });
            if (!response.ok) {
                throw new Error("Failed to update ticket on server.");
            }
            // --- FIX: Re-fetch tickets after a successful update to get the latest data ---
            await fetchTickets();
        } catch (err) {
            console.error('Failed to update ticket:', err);
            // Optionally, show an error message to the user
        }
    };

    const groupedTickets = useMemo(() => {
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
            } else if (['open', 'new', 'in progress', 'new reply'].includes(status)) {
                groups['Open Tickets'].push(ticket);
            } else if (status === 'awaiting customer') {
                groups['Waiting for Response'].push(ticket);
            } else if (status === 'resolved') {
                groups['Resolved Tickets'].push(ticket);
            }
        });
        return groups;
    }, [tickets]);
    
    const isITStaff = user?.groups?.includes('IT Staff');

    if (loading) return <p className="p-8 text-text-secondary">Loading tickets...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

    return (
        <div className="flex-1 p-6 md:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-text-primary">
                    {isITStaff ? 'All Tickets' : 'My Tickets'}
                </h1>
            </header>

            {Object.entries(groupedTickets).map(([groupName, groupTickets]) => (
                <div key={groupName}>
                    <h2 className={`text-sm font-bold mb-2 uppercase tracking-wider ${
                        groupName === 'Unassigned Tickets' ? 'text-red-600' : 
                        groupName === 'Open Tickets' ? 'text-blue-600' :
                        groupName === 'Waiting for Response' ? 'text-purple-600' :
                        'text-green-600'
                    }`}>{groupName} ({groupTickets.length})</h2>
                    <div className="bg-foreground rounded-lg border border-border shadow-sm text-sm">
                        <div className="grid grid-cols-[auto_3fr_1fr_1.5fr_1.5fr_2fr] text-xs font-semibold text-text-secondary border-b border-border">
                            <div className="p-2 pl-4 w-12"></div>
                            <div className="p-2 border-l border-border">Ticket</div>
                            <div className="p-2 border-l border-border text-center">Agent</div>
                            <div className="p-2 border-l border-border">Status</div>
                            <div className="p-2 border-l border-border">Priority</div>
                            <div className="p-2 border-l border-border">Creation Date</div>
                        </div>
                        {groupTickets.map(ticket => {
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
                        })}
                         <div className="border-t border-border p-2 pl-12">
                            <Link to="/tickets/create" className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm">
                                <FaPlus size={12} /> Add Ticket
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}