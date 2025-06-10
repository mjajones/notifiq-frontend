import React, { useEffect, useState } from 'react';

export default function CurrentTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // API URL from railway
  const API_URL = 'https://notifiq-backend-production.up.railway.app/api/incidents/';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(API_URL);
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

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedTickets = React.useMemo(() => {
    const arr = [...tickets];
    arr.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'submitted_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [tickets, sortKey, sortOrder]);

  // Renders for popup modal
  const renderModal = () => {
    if (!selectedTicket) return null;
    const t = selectedTicket;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-base-200 text-content-primary p-6 rounded-lg w-full max-w-2xl relative shadow-2xl">
          <button
            onClick={() => setSelectedTicket(null)}
            className="absolute top-3 right-4 text-2xl font-bold text-content-secondary hover:text-content-primary"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 border-b border-base-100 pb-2">Ticket #{t.id}: {t.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4">
            <p><span className="font-semibold text-content-secondary">Requester:</span> {t.requester || 'N/A'}</p>
            <p><span className="font-semibold text-content-secondary">Email:</span> {t.email || 'N/A'}</p>
            <p><span className="font-semibold text-content-secondary">Source:</span> {t.source || 'N/A'}</p>
            <p><span className="font-semibold text-content-secondary">Status:</span> {t.status}</p>
            <p><span className="font-semibold text-content-secondary">Priority:</span> {t.priority}</p>
            <p><span className="font-semibold text-content-secondary">Group:</span> {t.group || 'N/A'}</p>
            <p><span className="font-semibold text-content-secondary">Agent:</span> {t.agent || 'N/A'}</p>
            <p><span className="font-semibold text-content-secondary">Department:</span> {t.department || 'N/A'}</p>
            <p><span className="font-semibold text-content-secondary">Submitted:</span> {new Date(t.submitted_at).toLocaleString()}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-base-100">
            <h3 className="font-semibold text-content-secondary mb-2">Description</h3>
            <p className="whitespace-pre-wrap bg-base-300 p-3 rounded text-content-secondary">{t.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <p className="p-8 text-content-secondary">Loading tickets...</p>;
  }
  if (error) {
    return <p className="p-8 text-error">Error: {error}</p>;
  }

  return (
    <div className="text-content-primary">
      <h1 className="text-3xl font-bold mb-6">All Tickets</h1>

      <div className="overflow-x-auto bg-base-200 rounded-lg shadow-md">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-base-100 text-xs text-content-secondary uppercase tracking-wider">
            <tr>
              {['id', 'requester', 'title', 'priority', 'status', 'submitted_at'].map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-6 py-3 cursor-pointer select-none"
                >
                  {col.replace('_', ' ')}
                  {sortKey === col ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-base-100">
            {sortedTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-base-100 transition-colors duration-150"
                onClick={() => setSelectedTicket(ticket)}
              >
                <td className="px-6 py-4 font-medium text-content-accent cursor-pointer">{ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{ticket.requester || '-'}</td>
                <td className="px-6 py-4 text-content-primary">{ticket.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                      ticket.priority.toLowerCase() === 'high' ? 'bg-error/20 text-error' :
                      ticket.priority.toLowerCase() === 'medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                      ticket.status.toLowerCase() === 'open' ? 'bg-accent/20 text-accent' :
                      ticket.status.toLowerCase() === 'resolved' ? 'bg-success/20 text-success' : 'bg-base-300 text-content-secondary'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-content-secondary">
                  {new Date(ticket.submitted_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderModal()}
    </div>
  );
}
