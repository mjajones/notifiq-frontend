import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

export default function IncidentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('submitted_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/incidents/');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-yellow-600';
      case 'in progress': return 'text-blue-600';
      case 'resolved': return 'text-green-600';
      case 'closed': return 'text-gray-600';
      default: return 'text-black';
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getInitials = (email) => {
    return email?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Header />
      <h1 className="text-3xl font-bold mb-6">Incident Dashboard</h1>

      {loading ? (
        <p>Loading tickets...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {['id', 'title', 'email', 'priority', 'status', 'submitted_at'].map((field) => (
                  <th
                    key={field}
                    className="p-3 text-left cursor-pointer select-none"
                    onClick={() => handleSort(field)}
                  >
                    {field.replace('_', ' ').toUpperCase()}
                    {sortField === field && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="p-3">{ticket.id}</td>
                  <td className="p-3 font-medium flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-semibold">
                      {getInitials(ticket.email)}
                    </div>
                    {ticket.title}
                  </td>
                  <td className="p-3">{ticket.email}</td>
                  <td className="p-3">{ticket.priority}</td>
                  <td className={`p-3 font-semibold ${getStatusStyle(ticket.status)}`}>
                    {ticket.status}
                  </td>
                  <td className="p-3">{new Date(ticket.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl relative">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Ticket #{selectedTicket.id}</h2>
            <p><strong>Title:</strong> {selectedTicket.title}</p>
            <p><strong>Email:</strong> {selectedTicket.email}</p>
            <p><strong>Description:</strong> {selectedTicket.description}</p>
            <p><strong>Status:</strong> {selectedTicket.status}</p>
            <p><strong>Priority:</strong> {selectedTicket.priority}</p>
            <p><strong>Submitted:</strong> {new Date(selectedTicket.submitted_at).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}