import React, { useState, useEffect, useRef } from 'react';

// Header
const Header = () => (
    <header className="mb-6 border-b pb-2 border-border">
        <h1 className="text-2xl font-bold text-text-primary">NotifiQ</h1>
    </header>
);

// Icons
const FiPaperclip = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
    </svg>
);

const FiX = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const inputClass = "w-full bg-foreground p-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow text-text-primary placeholder:text-text-secondary/50";
const labelClass = "block mb-1.5 text-sm font-medium text-text-secondary";

export default function TicketForm() {
    const [formData, setFormData] = useState({
        requester: '',
        subject: '',
        source: 'portal',
        status: 'Open',
        urgency: 'Low',
        impact: 'Low',
        priority: 'Low',
        group: 'Level 1 Helpdesk',
        agent: '',
        department: 'IT',
        category: '',
        subCategory: '',
        description: '',
        tags: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [message, setMessage] = useState(null);
    const fileInputRef = useRef(null);
    
    // Empty array here
    const [agents, setAgents] = useState([]);
    const [agentsLoading, setAgentsLoading] = useState(true);
    const [agentsError, setAgentsError] = useState(null);

    // --- Options Definitions ---
    const sourceOptions = ['Portal', 'Phone', 'Email', 'MS Teams', 'Slack', 'Employee Onboarding', 'Employee Offboarding'];
    const statusOptions = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
    const urgencyOptions = ['Low', 'Medium', 'High', 'Urgent'];
    const impactOptions = ['Low', 'Medium', 'High'];
    const priorityOptions = [
        { value: 'Low', label: 'Low', color: 'bg-green-500' },
        { value: 'Medium', label: 'Medium', color: 'bg-blue-500' },
        { value: 'High', label: 'High', color: 'bg-orange-500' },
        { value: 'Urgent', label: 'Urgent', color: 'bg-red-500' },
    ];
    const groupOptions = ['Level 1 Helpdesk', 'Level 2 Helpdesk', 'Level 3 Helpdesk', 'Change Team', 'Database Team', 'Helpdesk Monitoring Team', 'Incident Team', 'Service Design Team', 'Software Team'];
    const departmentOptions = ['IT', 'HR', 'Sales', 'Operations', 'Marketing'];
    const categoryOptions = ['Hardware', 'Software', 'Network', 'Office Applications'];
    const subCategoryMap = {
        Hardware: ['Computer', 'Printer', 'Phone', 'Peripherals'],
        Software: ['MS Office', 'Adobe Reader', 'Windows', 'Chrome', 'Firefox', 'Microsoft Edge', 'Electronic Technician'],
        Network: ['Access', 'Connectivity'],
        'Office Applications': ['ViewPoint', 'DBS'],
    };

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await fetch(`${API_URL}/api/users/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                
                if (data && Array.isArray(data.results)) {
                    setAgents(data.results);
                } else if (Array.isArray(data)) {
                    setAgents(data);
                } else {
                    setAgents([]);
                }
            } catch (error) {
                setAgentsError(error.message);
                console.error("Error fetching agents:", error);
                setAgents([]);
            } finally {
                setAgentsLoading(false);
            }
        };

        fetchAgents();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value, }));
    };
    const handleTagInputChange = (e) => { setTagInput(e.target.value); };
    const handleTagKeyDown = (e) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !formData.tags.includes(newTag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            }
            setTagInput('');
        }
    };
    const removeTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove), }));
    };
    const handleFileChange = (e) => { setFiles(prev => [...prev, ...Array.from(e.target.files)]); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    };
    const removeFile = (fileToRemove) => { setFiles(prev => prev.filter(file => file !== fileToRemove)); }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'tags') {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });
        files.forEach(file => { data.append('attachments', file); });

        try {
            const resp = await fetch(`${API_URL}/api/incidents/`, { method: 'POST', body: data });
            if (resp.ok) {
                setMessage({ type: 'success', text: 'Ticket created successfully!' });
                setFormData({ requester: '', subject: '', source: 'portal', status: 'Open', urgency: 'Low', impact: 'Low', priority: 'Low', group: 'Level 1 Helpdesk', agent: '', department: 'IT', category: '', subCategory: '', description: '', tags: [] });
                setFiles([]);
                setTagInput('');
            } else {
                const errText = await resp.text();
                setMessage({ type: 'error', text: `Failed to create ticket: ${errText}` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred while submitting the ticket.' });
        }
    };


    return (
        <div className="flex-1 p-6 md:p-10">
            <Header />
            <h1 className="text-3xl font-bold mb-6 text-text-primary">New Ticket</h1>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                
                {agentsLoading && <p className="text-text-secondary">Loading users...</p>}
                {agentsError && <p className="text-red-500">Error loading users: {agentsError}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="requester" className={labelClass}>Requester</label>
                        <input id="requester" name="requester" type="text" value={formData.requester} onChange={handleChange} className={inputClass} placeholder="Search for an employee by name..." list="agents-list" required />
                    </div>
                    <div>
                        <label htmlFor="subject" className={labelClass}>Subject</label>
                        <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} className={inputClass} placeholder="A brief summary of the issue" required />
                    </div>
                </div>

                <datalist id="agents-list">
                    {agents && agents.map(agent => (
                        <option key={agent.id} value={`${agent.first_name} ${agent.last_name}`.trim() || agent.username} />
                    ))}
                </datalist>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label htmlFor="source" className={labelClass}>Source</label><select id="source" name="source" value={formData.source} onChange={handleChange} className={inputClass}>{sourceOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    <div><label htmlFor="status" className={labelClass}>Status</label><select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass}>{statusOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    <div><label htmlFor="priority" className={labelClass}>Priority</label><select id="priority" name="priority" value={formData.priority} onChange={handleChange} className={inputClass}>{priorityOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select><div className="flex items-center mt-2"><span className={`w-4 h-4 rounded-sm mr-2 ${priorityOptions.find(p => p.value === formData.priority)?.color}`}></span><span className="text-xs text-text-secondary">{formData.priority}</span></div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label htmlFor="urgency" className={labelClass}>Urgency</label><select id="urgency" name="urgency" value={formData.urgency} onChange={handleChange} className={inputClass}>{urgencyOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    <div><label htmlFor="impact" className={labelClass}>Impact</label><select id="impact" name="impact" value={formData.impact} onChange={handleChange} className={inputClass}>{impactOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label htmlFor="group" className={labelClass}>Group</label><select id="group" name="group" value={formData.group} onChange={handleChange} className={inputClass}>{groupOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    <div><label htmlFor="agent" className={labelClass}>IT Support Agent</label><input id="agent" name="agent" type="text" value={formData.agent} onChange={handleChange} className={inputClass} placeholder="Search or select an agent..." list="agents-list" /></div>
                </div>
                
                {/* Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="department" className={labelClass}>Department</label>
                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            {departmentOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label htmlFor="category" className={labelClass}>Category</label><select id="category" name="category" value={formData.category} onChange={handleChange} className={inputClass}><option value="">Select Category</option>{categoryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    {formData.category && subCategoryMap[formData.category] && (<div><label htmlFor="subCategory" className={labelClass}>Sub-Category</label><select id="subCategory" name="subCategory" value={formData.subCategory} onChange={handleChange} className={inputClass}><option value="">Select Sub-Category</option>{subCategoryMap[formData.category].map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>)}
                </div>
                <div><label htmlFor="description" className={labelClass}>Description</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="5" className={inputClass + ' resize-y'} placeholder="Provide a detailed description of the issue..." required /></div>
                <div><label htmlFor="tags" className={labelClass}>Tags</label><div className="flex flex-wrap items-center gap-2 p-2 bg-foreground border border-border rounded-md">{formData.tags.map(tag => (<span key={tag} className="flex items-center bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded-full">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-primary/70 hover:text-primary"><FiX size={14} /></button></span>))}<input id="tags" name="tags" type="text" value={tagInput} onChange={handleTagInputChange} onKeyDown={handleTagKeyDown} className="flex-grow bg-transparent focus:outline-none text-text-primary" placeholder={formData.tags.length === 0 ? "Add tags (e.g., vpn, outlook)..." : ""} /></div></div>
                <div><label className={labelClass}>Attachments</label><div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`relative border-2 border-dashed rounded-md p-6 text-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}><p className="text-text-secondary">Drop files here, or</p><button type="button" onClick={() => fileInputRef.current.click()} className="mt-2 text-primary font-semibold hover:underline focus:outline-none">browse to attach files</button><p className="text-xs text-text-secondary/70 mt-1">(File size &lt; 50 MB)</p><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple /></div>{files.length > 0 && (<div className="mt-4 space-y-2"><h4 className="font-semibold text-sm text-text-secondary">Attached files:</h4>{files.map((file, index) => (<div key={index} className="flex items-center justify-between bg-foreground p-2 border border-border rounded-md text-sm"><div className="flex items-center gap-2"><FiPaperclip className="text-text-secondary" /><span className="text-text-primary">{file.name}</span></div><button type="button" onClick={() => removeFile(file)} className="text-red-500 hover:text-red-700"><FiX /></button></div>))}</div>)}</div>
                <button type="submit" className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors">Submit Ticket</button>
                {message && (<p className={`text-center mt-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>)}
            </form>
        </div>
    );
}