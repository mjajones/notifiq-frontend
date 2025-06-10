import React, { useEffect, useState } from 'react';


export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // pick API URL from env
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${API_URL}/api/incidents/`);
        if (!response.ok) throw new Error('Failed to fetch tickets');
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [API_URL]);

  //sorting, handleChange, modal rendering

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-yellow-400';
      case 'in progress': return 'text-blue-400';
      case 'resolved': return 'text-green-500';
      case 'closed': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    if (sortOrder === 'asc') return String(aVal).localeCompare(String(bVal));
    return String(bVal).localeCompare(String(aVal));
  });

  const handleChange = (id, key, value) => {
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === id ? { ...ticket, [key]: value } : ticket))
    );
  };

  const renderModal = () => {
    if (!selectedTicket) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-[#2b2b3d] text-white p-6 rounded-lg w-full max-w-lg relative">
          <button
            onClick={() => setSelectedTicket(null)}
            className="absolute top-2 right-4 text-xl font-bold text-gray-400 hover:text-white"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4">Ticket #{selectedTicket.id} Details</h2>
          <p><span className="font-semibold">Subject:</span> {selectedTicket.title}</p>
          <p><span className="font-semibold">Requester:</span> {selectedTicket.requester || 'N/A'}</p>
          <p><span className="font-semibold">Source:</span> {selectedTicket.source || 'N/A'}</p>
          <p><span className="font-semibold">Department:</span> {selectedTicket.department || 'N/A'}</p>
          <p><span className="font-semibold">Group:</span> {selectedTicket.group || 'N/A'}</p>
          <p><span className="font-semibold">Agent:</span> {selectedTicket.agent || 'N/A'}</p>
          <p><span className="font-semibold">Category:</span> {selectedTicket.category || 'N/A'}</p>
          <p><span className="font-semibold">Sub-Category:</span> {selectedTicket.subCategory || 'N/A'}</p>
          <p><span className="font-semibold">Priority:</span> {selectedTicket.priority}</p>
          <p><span className="font-semibold">Status:</span> {selectedTicket.status}</p>
          <p><span className="font-semibold">Urgency:</span> {selectedTicket.urgency}</p>
          <p><span className="font-semibold">Impact:</span> {selectedTicket.impact}</p>
          <p className="mt-2"><span className="font-semibold">Description:</span><br />{selectedTicket.description}</p>
          <p className="mt-2 text-sm text-gray-400"><span className="font-semibold">Submitted:</span> {new Date(selectedTicket.submitted_at).toLocaleString()}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 border-b border-gray-600 pb-2">Incident Dashboard</h1>
      {loading ? (
        <p>Loading tickets...</p>
      ) : error ? (
        <p className="text-red-400">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2b2b3d] text-gray-300 uppercase text-xs">
              <tr>
                {['id', 'title', 'requester', 'source', 'priority', 'status', 'submitted_at'].map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="text-left px-4 py-3 cursor-pointer select-none"
                  >
                    {col.replace('_', ' ')} {sortKey === col ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[#1e1e2f] divide-y divide-gray-700">
              {sortedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-[#2e2e42] transition cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="px-4 py-2 font-medium">{ticket.id}</td>
                  <td className="px-4 py-2 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white font-semibold text-sm">
                      {ticket.title?.charAt(0).toUpperCase() || '?'}
                    </span>
                    {ticket.title}
                  </td>
                  <td className="px-4 py-2">{ticket.requester || '-'}</td>
                  <td className="px-4 py-2">{ticket.source || '-'}</td>
                  <td className="px-4 py-2 capitalize">
                    <select
                      value={ticket.priority}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleChange(ticket.id, 'priority', e.target.value)}
                      className="bg-transparent text-white outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={ticket.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleChange(ticket.id, 'status', e.target.value)}
                      className={`bg-transparent outline-none font-semibold ${getStatusColor(ticket.status)}`}
                    >
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(ticket.submitted_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {renderModal()}
    </div>
  );
}

