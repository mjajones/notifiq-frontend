import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FiSend, FiMail, FiUser, FiInfo } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const inputClass = "w-full bg-foreground p-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow text-text-primary placeholder:text-text-secondary/50";
const labelClass = "block mb-1.5 text-sm font-medium text-text-secondary";

export default function TicketDetail() {
    const { ticketId } = useParams();
    const { authTokens } = useContext(AuthContext);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [note, setNote] = useState('');

    const statusOptions = ['New', 'Open', 'In Progress', 'Awaiting customer', 'Resolved', 'Closed'];
    const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

    const fetchTicketDetails = useCallback(async () => {
        if (!authTokens) return;
        try {
            const response = await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                headers: {
                    'Authorization': `Bearer ${authTokens.access}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch ticket details.');
            const data = await response.json();
            setTicket(data);
        } catch (err) {
            setError(err.message);
        }
    }, [ticketId, authTokens]);

    useEffect(() => {
        setLoading(true);
        fetchTicketDetails().finally(() => setLoading(false));
    }, [fetchTicketDetails]);

    const handleUpdateTicket = async (field, value) => {
        const formData = new FormData();
        formData.append(field, value);

        try {
            const response = await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authTokens.access}` },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to update ticket.');
            const data = await response.json();
            setTicket(data);
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (note.trim() === '') return;

        const formData = new FormData();
        formData.append('internal_note', note);

        try {
            const response = await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authTokens.access}` },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to add note.');
            
            // Re-fetch the ticket to get the latest activity log
            await fetchTicketDetails();
            setNote('');
        } catch (error) {
            console.error("Failed to add note:", error);
        }
    };

    const handleNewEmail = () => {
        alert("New Email functionality would be triggered here.");
    };

    if (loading) return <p className="p-8 text-text-secondary">Loading ticket...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
    if (!ticket) return <p className="p-8">Ticket not found.</p>;

    return (
        <div className="flex-1 p-6 md:p-8">
            <div className="mb-6">
                <Link to="/tickets" className="text-sm text-primary hover:underline mb-2 block">&larr; Back to All Tickets</Link>
                <p className="text-sm text-text-secondary">Ticket #{ticket.id}</p>
                <h1 className="text-3xl font-bold text-text-primary">{ticket.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-foreground rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-3 text-text-primary">Add Note / Reply</h2>
                        <form onSubmit={handleAddNote}>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className={inputClass + ' resize-y'}
                                rows="4"
                                placeholder="Type your note or reply to the customer here..."
                            ></textarea>
                            <div className="flex justify-end items-center mt-3 gap-4">
                               <button onClick={handleNewEmail} type="button" className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300">
                                   <FiMail size={16} /> New Email
                               </button>
                               <button type="submit" className="flex items-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-primary-hover">
                                   <FiSend size={16} /> Add Note
                               </button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-text-primary">Activity</h2>
                        
                        {/* Original Ticket Description */}
                        <div className="flex gap-4">
                            <div className="bg-blue-100 text-blue-600 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center">
                                <FiInfo size={20} />
                            </div>
                            <div className="bg-foreground rounded-lg border border-border p-4 w-full">
                                <p className="font-semibold text-text-primary">{ticket.requester || 'Requester'}</p>
                                <p className="text-sm text-text-secondary mb-2">
                                    created the ticket on {new Date(ticket.submitted_at).toLocaleString()}
                                </p>
                                <div className="prose prose-sm max-w-none text-text-primary">
                                    <p>{ticket.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Log */}
                        {ticket.activity_log && ticket.activity_log.map((item, index) => (
                             <div key={index} className="flex gap-4">
                                <div className="bg-gray-100 text-gray-600 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center">
                                    <FiUser size={20} />
                                </div>
                                <div className="bg-foreground rounded-lg border border-border p-4 w-full">
                                    <p className="font-semibold text-text-primary">{item.user || 'User'}</p>
                                    <p className="text-sm text-text-secondary mb-2">
                                        added a note on {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                    <div className="prose prose-sm max-w-none text-text-primary">
                                        <p>{item.note}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-foreground rounded-lg border border-border shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-4 text-text-primary">Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="status" className={labelClass}>Status</label>
                                <select id="status" name="status" value={ticket.status} onChange={(e) => handleUpdateTicket('status', e.target.value)} className={inputClass}>
                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="priority" className={labelClass}>Priority</label>
                                <select id="priority" name="priority" value={ticket.priority} onChange={(e) => handleUpdateTicket('priority', e.target.value)} className={inputClass}>
                                    {priorityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <p className={labelClass}>Requester</p>
                                <p className="text-text-primary">{ticket.requester || 'N/A'}</p>
                            </div>
                            <div>
                                <p className={labelClass}>Agent</p>
                                <p className="text-text-primary">{ticket.agent_name || 'Unassigned'}</p>
                            </div>
                             <div>
                                <p className={labelClass}>Created</p>
                                <p className="text-text-primary">{new Date(ticket.submitted_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}