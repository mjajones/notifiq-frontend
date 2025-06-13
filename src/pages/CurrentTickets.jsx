import React, { useEffect, useState, useMemo, useContext } from 'react';
import AuthContext from '/src/context/AuthContext.jsx';
import StatusSelector from '/src/components/ui/StatusSelector.jsx';

const FaPlus = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
    </svg>
);


const statusOptions = [
    { value: 'New', label: 'New', colorClass: 'bg-gray-400' },
    { value: 'Open', label: 'Open', colorClass: 'bg-blue-400' },
    { value: 'In Progress', label: 'In Progress', colorClass: 'bg-indigo-500' },
    { value: 'Awaiting customer', label: 'Awaiting customer', colorClass: 'bg-purple-500' },
    { value: 'New reply', label: 'New reply', colorClass: 'bg-blue-500' },
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authTokens } = useContext(AuthContext);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchTickets = async () => {
            if (!authTokens) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/api/incidents/`, {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                if (!response.ok) throw new Error('Failed to fetch tickets');
                const data = await response.json();
                setTickets(Array.isArray(data) ? data : (data.results || []));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [authTokens, API_URL]);

    const handleTicketUpdate = async (ticketId, field, value) => {
        const originalTickets = [...tickets];
        const updatedTickets = tickets.map(t => 
            t.id === ticketId ? { ...t, [field]: value } : t
        );
        setTickets(updatedTickets);

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
            setTickets(originalTickets);
        }
    };

    const groupedTickets = useMemo(() => {
        if (!tickets) return {}; 
        const groups = {
            'Unassigned Tickets': [],
            'Open Tickets': [],
            'Waiting for Response': [],
            'Resolved Tickets': [],
        };
        
        tickets.forEach(ticket => {
            const status = (ticket.status || '').toLowerCase();
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

        return Object.fromEntries(Object.entries(groups).filter(([_, v]) => v.length > 0));
    }, [tickets]);

    if (loading) return <p className="p-8 text-text-secondary">Loading tickets...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

    return (
        <div className="flex-1 p-6 md:p-8 space-y-8">
            <header className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary">My Tickets</h1>
                <button className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary-hover text-sm">
                    <FaPlus /> New Ticket
                </button>
            </header>

            {Object.keys(groupedTickets).length > 0 ? Object.entries(groupedTickets).map(([groupName, groupTickets]) => (
                <div key={groupName}>
                    <h2 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">{groupName}</h2>
                    <div className="bg-foreground rounded-lg border border-border shadow-sm">
                        <div className="grid grid-cols-[auto_3fr_1fr_1.5fr_1.5fr_1fr_2fr] text-xs font-semibold text-text-secondary border-b border-border">
                            <div className="p-2 pl-4"></div>
                            <div className="p-2 border-l border-border">Ticket</div>
                            <div className="p-2 border-l border-border">Agent</div>
                            <div className="p-2 border-l border-border">Status</div>
                            <div className="p-2 border-l border-border">Priority</div>
                            <div className="p-2 border-l border-border">Creation Date</div>
                            <div className="p-2 border-l border-border">Email</div>
                        </div>
                        {groupTickets.map(ticket => (
                            <div key={ticket.id} className="grid grid-cols-[auto_3fr_1fr_1.5fr_1.5fr_1fr_2fr] items-center border-t border-border hover:bg-gray-50/50 text-sm">
                                <div className="p-2 pl-4 text-center">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                </div>
                                <div className="p-2 border-l border-border font-medium text-text-primary">{ticket.title}</div>
                                <div className="p-2 border-l border-border flex items-center justify-center">
                                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                                        {ticket.agent ? 'A' : '?'}
                                    </div>
                                </div>
                                <div className="p-2 border-l border-border">
                                    <StatusSelector
                                        options={statusOptions}
                                        value={ticket.status || ''}
                                        onChange={(newValue) => handleTicketUpdate(ticket.id, 'status', newValue)}
                                    />
                                </div>
                                <div className="p-2 border-l border-border">
                                    <StatusSelector
                                        options={priorityOptions}
                                        value={ticket.priority || ''}
                                        onChange={(newValue) => handleTicketUpdate(ticket.id, 'priority', newValue)}
                                    />
                                </div>
                                <div className="p-2 border-l border-border text-text-secondary">
                                    {new Date(ticket.submitted_at).toLocaleDateString()}
                                </div>
                                <div className="p-2 border-l border-border text-text-secondary">{ticket.requester_email || '-'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )) : <p className="text-text-secondary">No tickets to display.</p>}
        </div>
    );
}
