import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import { FiUser, FiPaperclip, FiSmile } from 'react-icons/fi';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// --- Sub-component for the Left Panel (Ticket Properties) ---
const TicketPropertiesPanel = ({ ticket, onUpdate }) => {
    const [itStaff, setItStaff] = useState([]);
    const { authTokens } = useContext(AuthContext);

    useEffect(() => {
        const fetchITStaff = async () => {
            if (!authTokens) return;
            try {
                const response = await fetch(`${API_URL}/api/users/?groups__name=IT Staff`, {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                const data = await response.json();
                setItStaff(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("Failed to fetch IT Staff", e);
            }
        };
        fetchITStaff();
    }, [authTokens]);

    return (
        <div className="bg-foreground rounded-lg border border-border p-4 space-y-6 shadow-sm">
            <div>
                <label className="text-sm font-medium text-text-secondary">Requester</label>
                <p className="text-text-primary font-semibold">{ticket.requester_name || 'N/A'}</p>
            </div>
            <div>
                <label htmlFor="agent" className="text-sm font-medium text-text-secondary">Assignee</label>
                <select
                    id="agent"
                    value={ticket.agent?.id || ''}
                    onChange={(e) => onUpdate('agent', e.target.value)}
                    className="w-full mt-1 p-2 border border-border rounded-md bg-foreground"
                >
                    <option value="">-- Unassigned --</option>
                    {itStaff.map(staff => (
                        <option key={staff.id} value={staff.id}>
                            {staff.first_name} {staff.last_name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium text-text-secondary">Tags</label>
                <div className="flex flex-wrap gap-2 mt-1">
                    {ticket.tags?.map((tag, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="type" className="text-sm font-medium text-text-secondary">Type</label>
                <select
                    id="type"
                    value={ticket.category || ''}
                    onChange={(e) => onUpdate('category', e.target.value)}
                    className="w-full mt-1 p-2 border border-border rounded-md bg-foreground"
                >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Network">Network</option>
                    <option value="Office Applications">Office Applications</option>
                </select>
            </div>
            <div>
                <label htmlFor="priority" className="text-sm font-medium text-text-secondary">Priority</label>
                <select
                    id="priority"
                    value={ticket.priority || 'Low'}
                    onChange={(e) => onUpdate('priority', e.target.value)}
                    className="w-full mt-1 p-2 border border-border rounded-md bg-foreground"
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>
        </div>
    );
};

// --- Sub-component for the Right Panel (User Info & History) ---
const ContextPanel = ({ ticket }) => {
    const ticketHistory = ticket.activity_log || [];

    return (
        <div className="space-y-6">
            <div className="bg-foreground rounded-lg border border-border p-4 shadow-sm">
                <h3 className="font-semibold text-text-primary">{ticket.requester_name}</h3>
                <a href={`mailto:${ticket.requester_email}`} className="text-sm text-primary hover:underline">{ticket.requester_email}</a>
                <div className="mt-4 text-sm space-y-1">
                    <p><span className="text-text-secondary">Local time:</span> {new Date().toLocaleTimeString()}</p>
                    <p><span className="text-text-secondary">Language:</span> English (United States)</p>
                </div>
                <div className="mt-4">
                     <label className="text-sm font-medium text-text-secondary">Notes</label>
                     <textarea placeholder="Add user notes..." rows="3" className="w-full mt-1 p-2 border border-border rounded-md bg-background"></textarea>
                </div>
            </div>
            <div className="bg-foreground rounded-lg border border-border p-4 shadow-sm">
                <h3 className="font-semibold text-text-primary mb-3">Interaction History</h3>
                <ul className="space-y-3">
                    {ticketHistory.length > 0 ? ticketHistory.map(item => (
                        <li key={item.id}>
                            <p className="text-sm text-text-primary font-medium">{item.activity_type}</p>
                            <p className="text-xs text-text-secondary">
                                {new Date(item.timestamp).toLocaleString()} by {item.user}
                            </p>
                        </li>
                    )) : (
                        <p className="text-sm text-text-secondary">No activity recorded for this ticket.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}

// --- Main Ticket Detail Component ---
export default function TicketDetail() {
    const { ticketId } = useParams();
    const { authTokens } = useContext(AuthContext);
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const fetchTicketDetails = useCallback(async () => {
        if (!authTokens || !ticketId) return;
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            if (!response.ok) throw new Error('Failed to fetch ticket details.');
            const data = await response.json();
            setTicket(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [ticketId, authTokens]);

    useEffect(() => {
        fetchTicketDetails();
    }, [fetchTicketDetails]);

    const handleUpdateTicket = async (field, value) => {
        const formData = new FormData();
        formData.append(field, value);

        try {
            await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authTokens.access}` },
                body: formData
            });
            await fetchTicketDetails();
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleAddReply = async () => {
        if (replyContent.trim() === '') return;
        await handleUpdateTicket('internal_note', replyContent.replace(/<[^>]*>/g, ''));
        setReplyContent('');
    };

    // Filter the activity log to create a clean conversation view
    const conversation = useMemo(() => {
        if (!ticket) return [];
        const combined = [
            // Add the original ticket description as the first item
            {
                id: `initial-${ticket.id}`,
                user: ticket.requester_name,
                timestamp: ticket.submitted_at,
                note: ticket.description
            },
            // Filter activity log to only include 'Note Added' items
            ...(ticket.activity_log || []).filter(item => item.activity_type === 'Note Added')
        ];
        return combined.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [ticket]);

    if (loading) return <p className="p-8 text-text-secondary">Loading ticket...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
    if (!ticket) return <p className="p-8">Ticket not found.</p>;

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-full">
            <div className="mb-4">
                <Link to="/tickets" className="text-sm text-primary hover:underline mb-2 block">&larr; Back to All Tickets</Link>
                <h2 className="text-2xl font-bold text-text-primary">{ticket.title}</h2>
                <p className="text-sm text-text-secondary">Ticket #{ticket.id}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* --- Left Column --- */}
                <div className="lg:col-span-3">
                    <TicketPropertiesPanel ticket={ticket} onUpdate={handleUpdateTicket} />
                </div>

                {/* --- Middle Column (Conversation) --- */}
                <div className="lg:col-span-6 bg-foreground border border-border rounded-lg shadow-sm">
                    <div className="p-6 space-y-6">
                        {conversation.map((item, index) => (
                            <div key={item.id} className={`flex gap-4 ${index !== 0 ? 'pt-6 border-t border-border' : ''}`}>
                                <div className="bg-gray-200 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center">
                                    <FiUser size={20} />
                                </div>
                                <div className="w-full">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-text-primary">{item.user || 'System'}</p>
                                        <p className="text-xs text-text-secondary">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-text-primary mt-1" dangerouslySetInnerHTML={{ __html: item.note }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-4 border-t border-border">
                         <ReactQuill 
                            theme="snow" 
                            value={replyContent} 
                            onChange={setReplyContent}
                            placeholder="Type your reply here..."
                            className="h-48 mb-12" // Increased height
                         />
                        <div className="pt-2 flex justify-end items-center">
                            <button
                                onClick={handleAddReply}
                                className="bg-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-primary-hover"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Right Column --- */}
                <div className="lg:col-span-3">
                    <ContextPanel ticket={ticket} />
                </div>
            </div>
        </div>
    );
}