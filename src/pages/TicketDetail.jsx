import React, { useState, useEffect, useContext, useCallback } from 'react';
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
        <div className="bg-foreground rounded-lg border border-border p-4 space-y-6">
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
                    <option value="Hardware">Hardwaree</option>
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

// --- Sub-component Right Panel (User Info) ---
const RequesterInfoPanel = ({ ticket }) => {
    const [interactionHistory, setInteractionHistory] = useState([]);
    const { authTokens } = useContext(AuthContext);

    useEffect(() => {
        if (!ticket.requester_email) return;
        const fetchHistory = async () => {
            if (!authTokens) return;
            try {
                const response = await fetch(`${API_URL}/api/incidents/?requester_email=${ticket.requester_email}`, {
                     headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                const data = await response.json();
                const history = (Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []).filter(t => t.id !== ticket.id);
                setInteractionHistory(history);
            } catch(e) {
                console.error("Could not fetch interaction history", e);
            }
        };
        fetchHistory();
    }, [ticket.requester_email, ticket.id, authTokens]);

    return (
        <div className="space-y-6">
            <div className="bg-foreground rounded-lg border border-border p-4">
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
            <div className="bg-foreground rounded-lg border border-border p-4">
                <h3 className="font-semibold text-text-primary mb-3">Interaction History</h3>
                <ul className="space-y-3">
                    {interactionHistory.length > 0 ? interactionHistory.map(item => (
                        <li key={item.id}>
                            <Link to={`/tickets/${item.id}`} className="text-sm text-primary hover:underline font-medium">{item.title}</Link>
                            <p className="text-xs text-text-secondary">{new Date(item.submitted_at).toLocaleDateString()} - {item.status.name}</p>
                        </li>
                    )) : (
                        <p className="text-sm text-text-secondary">No other tickets found for this user.</p>
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
            const response = await fetch(`${API_URL}/api/incidents/${ticketId}/`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${authTokens.access}` },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to update ticket.');
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
    
    const conversation = useMemo(() => {
        if (!ticket) return [];
        const combined = [];
        combined.push({
            id: `initial-${ticket.id}`,
            user: ticket.requester_name,
            timestamp: ticket.submitted_at,
            isDescription: true,
            note: ticket.description
        });
        if (ticket.activity_log) {
            combined.push(...ticket.activity_log);
        }
        return combined.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [ticket]);

    if (loading) return <p className="p-8 text-text-secondary">Loading ticket...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;
    if (!ticket) return <p className="p-8">Ticket not found.</p>;

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-text-primary">{ticket.title}</h2>
                <p className="text-sm text-text-secondary">
                    Ticket #{ticket.id}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-3">
                    <TicketPropertiesPanel ticket={ticket} onUpdate={handleUpdateTicket} />
                </div>

                <div className="lg:col-span-6">
                    <div className="space-y-6">
                        {conversation.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="bg-gray-200 rounded-full h-10 w-10 flex-shrink-0 flex items-center justify-center">
                                    <FiUser size={20} />
                                </div>
                                <div className="w-full">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-text-primary">{item.user || 'System'}</p>
                                        <p className="text-xs text-text-secondary">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-text-primary mt-1">
                                        {item.isDescription ? (
                                            <p>{item.note}</p>
                                        ) : item.activity_type === 'Note Added' ? (
                                            <p>{item.note}</p>
                                        ) : (
                                            <p className="text-sm text-text-secondary italic">
                                                Changed {item.activity_type.split(' ')[0]} from '{item.old_value || 'None'}' to '{item.new_value || 'None'}'
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8">
                         <h3 className="font-semibold mb-2">Public Reply</h3>
                         <div className="bg-foreground rounded-lg border border-border">
                            <ReactQuill 
                                theme="snow" 
                                value={replyContent} 
                                onChange={setReplyContent}
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline','strike', 'blockquote'],
                                        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                                        ['link'],
                                        ['clean']
                                    ],
                                }}
                            />
                            <div className="p-2 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-text-secondary hover:bg-gray-200 rounded-md"><FiPaperclip /></button>
                                    <button className="p-2 text-text-secondary hover:bg-gray-200 rounded-md"><FiSmile /></button>
                                </div>
                                <button
                                    onClick={handleAddReply}
                                    className="bg-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-primary-hover"
                                >
                                    Submit
                                </button>
                            </div>
                         </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <RequesterInfoPanel ticket={ticket} />
                </div>
            </div>
        </div>
    );
}