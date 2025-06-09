import React, { useEffect, useState } from 'react';

export default function IncidentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState('submitted_at');
  const [sortDirection, setSortDirection] = useState('desc');

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

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-yellow-600';
      case 'in progress': return 'text-blue-500';
      case 'resolved': return 'text-green-500';
      case 'closed': return 'text-gray-500';
      default: return 'text-white';
    }
  };

  const getInitials = (ticket) => {
    const name = ticket.email || ticket.title || '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-6 border-b border-zinc-700 pb-2">Incident Dashboard</h1>

        {loading ? (
          <p className="text-zinc-300">Loading tickets...</p>
        ) : error ? (
          <p className="text-red-400">Error: {error}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-700">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-800 text-zinc-300 uppercase text-left text-xs">
                <tr>
                  {['ID', 'Title', 'Email', 'Priority', 'Status', 'Submitted At'].map((col, i) => (
                    <th
                      key={col}
                      className="p-3 cursor-pointer"
                      onClick={() => handleSort(col.toLowerCase().replace(/\s/g, '_'))}
                    >
                      {col}
                      {sortColumn === col.toLowerCase().replace(/\s/g, '_') &&
                        (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map((ticket, idx) => (
                  <tr
                    key={ticket.id}
                    className={`border-t border-zinc-700 ${
                      idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800'
                    } hover:bg-zinc-700 transition-colors`}
                  >
                    <td className="p-3">{ticket.id}</td>
                    <td className="p-3 flex items-center gap-2 font-medium">
                      <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center text-xs text-white">
                        {getInitials(ticket)}
                      </div>
                      {ticket.title}
                    </td>
                    <td className="p-3">{ticket.email || '-'}</td>
                    <td className="p-3 capitalize">{ticket.priority}</td>
                    <td className={`p-3 font-semibold ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </td>
                    <td className="p-3">
                      {new Date(ticket.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
