import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext.jsx'; //

const inputClass = "w-full bg-foreground p-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow text-text-primary placeholder:text-text-secondary/50";
const labelClass = "block mb-1.5 text-sm font-medium text-text-secondary";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AssetForm() {
    const [formData, setFormData] = useState({
        assetName: '', assetTag: '', assetType: '', impact: 'Low',
        description: '', endOfLife: '', location: 'US',
        department: 'IT', managedByGroup: 'Helpdesk Monitoring Team',
        managedBy: ''
    });
    const [itStaff, setItStaff] = useState([]);
    const [message, setMessage] = useState('');
    const { authTokens } = useContext(AuthContext);

    // All options
    const assetTypeOptions = [
        'Laptop', 'Desktop', 'Monitor', 'Phone', 'Software License', 'Others', 'Document', 
        'Network', 'Firewall', 'Access Point', 'Switch', 'Scanner', 'Printer', 'Mobile Device', 
        'Tablet', 'UPS', 'Rack', 'Storage', 'VMware', 'Virtual Machine', 'Subscription', 
        'Database', 'Subnet', 'Public IP Address', 'Load Balancer', 'Email Service', 
        'Hosting Service'
    ];
    const impactOptions = ['Low', 'Medium', 'High'];
    const departmentOptions = ['IT', 'HR', 'Sales', 'Operations', 'Marketing'];
    const groupOptions = ['Level 1 Helpdesk', 'Level 2 Helpdesk', 'Level 3 Helpdesk', 'Change Team', 'Database Team', 'Helpdesk Monitoring Team', 'Incident Team', 'Service Design Team', 'Software Team'];

    // Fetch IT staff
    useEffect(() => {
        const fetchItStaff = async () => {
            if (!authTokens) return;
            try {
                const response = await fetch(`${API_URL}/api/users/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authTokens.access}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch IT staff');
                const data = await response.json();
                setItStaff(Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching IT staff:", error);
            }
        };
        fetchItStaff();
    }, [authTokens]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        setMessage('New asset created successfully! (Simulation)');

                const payload = {
            name: formData.assetName,
            tag: formData.assetTag,
            asset_type: formData.assetType,
            impact: formData.impact,
            description: formData.description,
            end_of_life: formData.endOfLife || null, // If date empty
            location: formData.location,
            department: formData.department,
            managed_by_group: formData.managedByGroup,
            managed_by: formData.managedBy || null, // For no agent select
        };

        try {
            const response = await fetch(`${API_URL}/api/assets/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage('New asset created successfully!');
                // Reset form
                setFormData({
                    assetName: '',
                    assetTag: '',
                    assetType: '',
                    impact: 'Low',
                    description: '',
                    endOfLife: '',
                    location: 'US',
                    department: 'IT',
                    managedByGroup: 'Helpdesk Monitoring Team',
                    managedBy: ''
                });
            } else {
                const errorData = await response.json();
                const errorMessage = Object.values(errorData).flat().join(' ');
                setMessage(`Failed to create asset: ${errorMessage}`);
            }
        } catch (error) {
            console.error("Error submitting asset:", error);
            setMessage('An error occurred while connecting to the server.');
        }
    };
    
    const handleCancel = () => {
        // Back to asset page
        console.log("Form cancelled");
    };

    return (
        <div className="flex-1 p-6 md:p-10">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text-primary">Add New Asset</h1>
                <div>
                    <button type="button" onClick={handleCancel} className="bg-foreground text-text-primary px-4 py-2 rounded-md border border-border mr-2 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" form="asset-form" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
                        Save
                    </button>
                </div>
            </header>

            {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">{message}</div>}

            <form id="asset-form" onSubmit={handleSubmit} className="space-y-8 bg-foreground p-8 rounded-lg border border-border shadow-sm">
                {/* Top */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="assetName" className={labelClass}>Asset Name *</label>
                        <input id="assetName" name="assetName" type="text" value={formData.assetName} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="assetTag" className={labelClass}>Asset Tag</label>
                        <input id="assetTag" name="assetTag" type="text" value={formData.assetTag} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="assetType" className={labelClass}>Asset Type *</label>
                        <select id="assetType" name="assetType" value={formData.assetType} onChange={handleChange} className={inputClass} required>
                            <option value="">-- Choose --</option>
                            {assetTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="impact" className={labelClass}>Impact</label>
                        <select id="impact" name="impact" value={formData.impact} onChange={handleChange} className={inputClass}>
                            {impactOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className={labelClass}>Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="5" className={inputClass + ' resize-y'} placeholder="Add a description..."></textarea>
                </div>

                <div>
                    <label htmlFor="endOfLife" className={labelClass}>End of Life</label>
                    <input id="endOfLife" name="endOfLife" type="date" value={formData.endOfLife} onChange={handleChange} className={inputClass} />
                </div>

                {/* Assignment */}
                <div className="border-t border-border pt-8">
                    <h2 className="text-xl font-semibold text-text-primary mb-6">Assignment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="location" className={labelClass}>Location</label>
                            <input id="location" name="location" type="text" value={formData.location} readOnly className={inputClass + ' bg-gray-100 cursor-not-allowed'} />
                        </div>
                        <div>
                            <label htmlFor="department" className={labelClass}>Department</label>
                            <select id="department" name="department" value={formData.department} onChange={handleChange} className={inputClass}>
                                {departmentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="managedByGroup" className={labelClass}>Managed By Group</label>
                            <select id="managedByGroup" name="managedByGroup" value={formData.managedByGroup} onChange={handleChange} className={inputClass}>
                                {groupOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="managedBy" className={labelClass}>Managed By</label>
                            <select id="managedBy" name="managedBy" value={formData.managedBy} onChange={handleChange} className={inputClass}>
                                <option value="">-- Choose Staff --</option>
                                {itStaff.map(staff => <option key={staff.id} value={staff.id}>{`${staff.first_name} ${staff.last_name}`.trim() || staff.username}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}