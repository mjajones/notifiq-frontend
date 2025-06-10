import React, { useState, useEffect } from 'react';
import Header from '../components/Header'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Reusable input/select classes
const inputClass =
  'w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500';
const labelClass = 'block mb-1 font-medium text-gray-200';

export default function TicketForm() {
  // Form fields
  const [formData, setFormData] = useState({
    requester: '',
    subject: '',          
    source: 'phone',
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
  });

  const [message, setMessage] = useState(null);
  // Options definitions
  const sourceOptions = ['phone', 'email', 'portal'];
  const statusOptions = ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
  const urgencyOptions = ['Low', 'Medium', 'High'];
  const impactOptions = ['Low', 'Medium', 'High'];
  const priorityOptions = ['Low', 'Medium', 'High'];
  const groupOptions = ['Level 1 Helpdesk', 'Level 2 Helpdesk', 'Level 3 Helpdesk'];
  const departmentOptions = ['IT', 'HR', 'Sales', 'Operations', 'Marketing'];
  const categoryOptions = ['Hardware', 'Software', 'Network', 'Office Applications'];
  // Subcategory mapping
  const subCategoryMap = {
    Hardware: ['Computer', 'Printer', 'Phone', 'Peripherals'],
    Software: ['MS Office', 'Adobe Reader', 'Windows', 'Chrome', 'Firefox', 'Microsoft Edge', 'Electronic Technician'],
    Network: ['Access', 'Connectivity'],
    'Office Applications': ['ViewPoint', 'DBS'],
  };

  // Reset sub when category changed
  useEffect(() => {
    const cat = formData.category;
    if (cat && subCategoryMap[cat]) {
      if (!subCategoryMap[cat].includes(formData.subCategory)) {
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      }
    } else {
      // Clear sub if main cleared
      if (formData.subCategory) {
        setFormData((prev) => ({ ...prev, subCategory: '' }));
      }
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Matches backend filds
    const payload = {
      title: formData.subject,
      description: formData.description,
      requester: formData.requester,
      source: formData.source,
      status: formData.status,
      urgency: formData.urgency,
      impact: formData.impact,
      priority: formData.priority,
      group: formData.group,
      agent: formData.agent,
      department: formData.department,
      category: formData.category,
      subCategory: formData.subCategory,

    };

    try {
      const resp = await fetch(`${API_URL}/api/incidents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        setMessage({ type: 'success', text: 'Ticket created successfully!' });
        // Reset form
        setFormData({
          requester: '',
          subject: '',
          source: 'phone',
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
        });
      } else {
        const errText = await resp.text();
        console.error('Failed to create ticket:', resp.status, errText);
        setMessage({ type: 'error', text: `Failed to create ticket: ${resp.status}` });
      }
    } catch (err) {
      console.error('Error on submit:', err);
      setMessage({ type: 'error', text: 'Error submitting ticket.' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#111025] text-white">

      <div className="flex-1 p-6 md:p-10">
        <Header />
        <h1 className="text-4xl font-bold mb-6">New Ticket</h1>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          {/* Requester */}
          <div>
            <label htmlFor="requester" className={labelClass}>Requester</label>
            <input
              id="requester"
              name="requester"
              type="text"
              value={formData.requester}
              onChange={handleChange}
              className={inputClass}
              placeholder="Your name or user ID"
              required
            />
          </div>
          {/* Subject */}
          <div>
            <label htmlFor="subject" className={labelClass}>Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              className={inputClass}
              placeholder="Short summary"
              required
            />
          </div>
          {/* Source */}
          <div>
            <label htmlFor="source" className={labelClass}>Source</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={inputClass}
            >
              {sourceOptions.map((opt) => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </div>
          {/* Status */}
          <div>
            <label htmlFor="status" className={labelClass}>Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Urgency */}
          <div>
            <label htmlFor="urgency" className={labelClass}>Urgency</label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className={inputClass}
            >
              {urgencyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Impact */}
          <div>
            <label htmlFor="impact" className={labelClass}>Impact</label>
            <select
              id="impact"
              name="impact"
              value={formData.impact}
              onChange={handleChange}
              className={inputClass}
            >
              {impactOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Priority */}
          <div>
            <label htmlFor="priority" className={labelClass}>Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={inputClass}
            >
              {priorityOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Group */}
          <div>
            <label htmlFor="group" className={labelClass}>Group</label>
            <select
              id="group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              className={inputClass}
            >
              {groupOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Agent */}
          <div>
            <label htmlFor="agent" className={labelClass}>IT Support Agent</label>
            <input
              id="agent"
              name="agent"
              type="text"
              value={formData.agent}
              onChange={handleChange}
              className={inputClass}
              placeholder="Agent name (if assigning now)"
            />
          </div>
          {/* Department */}
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
          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClass}>Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select Category</option>
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {/* Sub-Category */}
          {formData.category && subCategoryMap[formData.category] && (
            <div>
              <label htmlFor="subCategory" className={labelClass}>Sub-Category</label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Sub-Category</option>
                {subCategoryMap[formData.category].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}
          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className={inputClass + ' resize-none'}
              placeholder="Detailed description..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Ticket
          </button>

          {message && (
            <p
              className={
                message.type === 'success'
                  ? 'text-green-400 mt-2'
                  : 'text-red-400 mt-2'
              }
            >
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
