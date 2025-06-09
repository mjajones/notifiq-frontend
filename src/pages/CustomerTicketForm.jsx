import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

export default function CustomerTicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Open');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const response = await fetch('/api/incidents/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, priority, status, email, submitted_at: timestamp })
    });

    if (response.ok) {
      setMessage('Ticket submitted successfully!');
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('Open');
      setEmail('');
      setSubmittedAt(timestamp);
    } else {
      setMessage('Failed to submit ticket.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Header />
      <h1 className="text-3xl font-bold mb-4">Submit a Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            required
          ></textarea>
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Ticket
        </button>
        {message && <p className="text-center mt-2 text-green-700">{message}</p>}
      </form>
    </div>
  );
}