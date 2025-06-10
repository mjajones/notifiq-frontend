import React, { useState } from 'react';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CustomerTicketForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Open');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      priority,
      status,
      email,
    };

    try {
      const response = await fetch(`${API_URL}/api/incidents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage('Ticket submitted successfully!');
        // clear form
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setStatus('Open');
        setEmail('');
      } else {
        console.error('Submit failed, status:', response.status);
        setMessage('Failed to submit ticket.');
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
      setMessage('Error submitting ticket.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Header />
      <h1 className="text-3xl font-bold mb-4">Submit a Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
            rows="4"
            required
          ></textarea>
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
            required
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block mb-1 font-medium">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>On Hold</option>
            <option>Resolved</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Ticket
        </button>

        {message && (
          <p className={`text-center mt-2 ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
