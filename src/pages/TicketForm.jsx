import React, { useState } from 'react';



export default function TicketForm() {
  const [formData, setFormData] = useState({
    requester: '',
    subject: '',
    source: 'phone',
    status: 'open',
    urgency: 'low',
    impact: 'low',
    priority: 'low',
    group: 'Level 1 Helpdesk',
    agent: '',
    department: 'IT',
    category: '',
    subCategory: '',
    description: ''
  });

    const subCategoryOptions = {
    Hardware: ['Computer', 'Printer', 'Phone', 'Peripherals'],
    Software: ['MS Office', 'Adobe Reader', 'Windows', 'Chrome', 'Firefox', 'Microsoft Edge', 'Electronic Technician'],
    Network: ['Access', 'Connectivity'],
    'Office Applications': ['ViewPoint', 'DBS']
  };

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

    const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

  };

    return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-white">New Ticket</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['requester', 'subject', 'agent'].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChange={handleChange}
            className="bg-gray-800 text-white p-2 rounded"
            required
          />
        ))}

        <select name="source" value={formData.source} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
        {['phone', 'email', 'portal'].map(option => <option key={option}>{option}</option>)}
        </select>

        <select name="status" value={formData.status} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
        {['open', 'in progress', 'on hold', 'resolved'].map(option => <option key={option}>{option}</option>)}
        </select>

        <select name="urgency" value={formData.urgency} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
          {['low', 'medium', 'high'].map(option => <option key={option}>{option}</option>)}
        </select>

        <select name="impact" value={formData.impact} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
          {['low', 'medium', 'high'].map(option => <option key={option}>{option}</option>)}
        </select>

        <select name="priority" value={formData.priority} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
          {['low', 'medium', 'high'].map(option => <option key={option}>{option}</option>)}
        </select>

        <select name="group" value={formData.group} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
          {['Level 1 Helpdesk', 'Level 2 Helpdesk', 'Level 3 Helpdesk'].map(option => <option key={option}>{option}</option>)}
        </select>

        <select name="department" value={formData.department} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
          {['IT', 'HR', 'Sales', 'Operations', 'Marketing'].map(option => <option key={option}>{option}</option>)}
        </select>

        <select name="category" value={formData.category} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
          <option value="">Select Category</option>
          {Object.keys(subCategoryOptions).map(cat => <option key={cat}>{cat}</option>)}
        </select>

        {formData.category && (
          <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="bg-gray-800 text-white p-2 rounded">
            <option value="">Select Sub-Category</option>
            {subCategoryOptions[formData.category].map(sub => <option key={sub}>{sub}</option>)}
          </select>
        )}

        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="bg-gray-800 text-white p-2 rounded col-span-1 md:col-span-2 min-h-[150px]"
        ></textarea>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded col-span-1 md:col-span-2">Submit</button>
      </form>
    </div>
  );
}