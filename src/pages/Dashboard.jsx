import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

export default function IncidentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('https://notifiq-backend-production.up.railway.app/api/incidents/');
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
  }, []);

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
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortOrder === 'asc') return String(a[sortKey]).localeCompare(String(b[sortKey]));
    return String(b[sortKey]).localeCompare(String(a[sortKey]));
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
        <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md relative">
          <button
            onClick={() => setSelectedTicket(null)}
            className="absolute top-2 right-4 text-xl font-bold text-gray-400 hover:text-white"
          >
            ×
          </button>
          <h2 className="text-xl font-bold mb-4">Ticket #{selectedTicket.id} Details</h2>
          <p><span className="font-semibold">Title:</span> {selectedTicket.title}</p>
          <p><span className="font-semibold">Email:</span> {selectedTicket.email || 'N/A'}</p>
          <p><span className="font-semibold">Description:</span> {selectedTicket.description}</p>
          <p><span className="font-semibold">Priority:</span> {selectedTicket.priority}</p>
          <p><span className="font-semibold">Status:</span> {selectedTicket.status}</p>
          <p><span className="font-semibold">Submitted:</span> {new Date(selectedTicket.submitted_at).toLocaleString()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white bg-[#1e1e2f] min-h-screen">
      <Header />
      <h1 className="text-4xl font-bold mb-6 border-b border-gray-600 pb-2">Incident Dashboard</h1>

      {loading ? (
        <p>Loading tickets...</p>
      ) : error ? (
        <p className="text-red-400">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2b2b3d] text-gray-300 uppercase text-xs">
              <tr>
                {['id', 'title', 'email', 'priority', 'status', 'submitted_at'].map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="text-left px-4 py-3 cursor-pointer select-none"
                  >
                    {col.replace('_', ' ')}{' '}
                    {sortKey === col ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
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
                  <td className="px-4 py-2">{ticket.email || '-'}</td>
                  <td className="px-4 py-2 capitalize">
                    <select
                      value={ticket.priority}
                      onChange={(e) => handleChange(ticket.id, 'priority', e.target.value)}
                      className="bg-transparent outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td className={`px-4 py-2 font-semibold ${getStatusColor(ticket.status)}`}>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleChange(ticket.id, 'status', e.target.value)}
                      className="bg-transparent outline-none"
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
