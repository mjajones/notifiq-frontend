import React, { useEffect, useState } from 'react';

export default function CurrentTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);

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
      // If dates, convert to Date for comparison
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

  const handleInlineChange = async (id, key, value) => {
   
    setTickets(prev =>
      prev.map(t => t.id === id ? { ...t, [key]: value } : t)
    );
   
    try {
      await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
 
    } catch (err) {
      console.error('Failed to update ticket:', err);
 
    }
  };

  const renderModal = () => {
    if (!selectedTicket) return null;
    const t = selectedTicket;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-lg relative">
          <button
            onClick={() => setSelectedTicket(null)}
            className="absolute top-2 right-4 text-xl font-bold text-gray-400 hover:text-white"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-4">Ticket #{t.id} Details</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Requester:</span> {t.requester || '-'}</p>
            <p><span className="font-semibold">Email:</span> {t.email || 'N/A'}</p>
            <p><span className="font-semibold">Subject:</span> {t.title || '-'}</p>
            <p><span className="font-semibold">Source:</span> {t.source || '-'}</p>
            <p><span className="font-semibold">Status:</span> {t.status}</p>
            <p><span className="font-semibold">Urgency:</span> {t.urgency || '-'}</p>
            <p><span className="font-semibold">Impact:</span> {t.impact || '-'}</p>
            <p><span className="font-semibold">Priority:</span> {t.priority}</p>
            <p><span className="font-semibold">Group:</span> {t.group || '-'}</p>
            <p><span className="font-semibold">IT Support Agent:</span> {t.agent || '-'}</p>
            <p><span className="font-semibold">Department:</span> {t.department || '-'}</p>
            <p><span className="font-semibold">Category:</span> {t.category || '-'}</p>
            <p><span className="font-semibold">Sub-Category:</span> {t.subCategory || '-'}</p>
            <p><span className="font-semibold">Submitted At:</span> {new Date(t.submitted_at).toLocaleString()}</p>
            <div>
              <span className="font-semibold">Description:</span>
              <p className="mt-1 whitespace-pre-wrap bg-gray-800 p-2 rounded">{t.description || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <p>Loading tickets...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-red-400">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white bg-[#1e1e2f] min-h-screen">
      <h1 className="text-4xl font-bold mb-6 border-b border-gray-600 pb-2">All Tickets</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-[#2b2b3d] text-gray-300 uppercase text-xs">
            <tr>
              {['id', 'requester', 'title', 'email', 'priority', 'status', 'submitted_at'].map((col) => (
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
                <td className="px-4 py-2">{ticket.requester || '-'}</td>
                <td className="px-4 py-2">{ticket.title}</td>
                <td className="px-4 py-2">{ticket.email || '-'}</td>
                <td className="px-4 py-2">
                  <select
                    value={ticket.priority}
                    onClick={e => e.stopPropagation()}
                    onChange={(e) => handleInlineChange(ticket.id, 'priority', e.target.value)}
                    className="bg-transparent outline-none text-white"
                  >
                    {['low', 'medium', 'high'].map(opt => (
                      <option key={opt} value={opt} className="bg-[#1e1e2f] text-white">
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={`px-4 py-2 font-semibold ${getStatusColor(ticket.status)}`}>
                  <select
                    value={ticket.status}
                    onClick={e => e.stopPropagation()}
                    onChange={(e) => handleInlineChange(ticket.id, 'status', e.target.value)}
                    className="bg-transparent outline-none text-white"
                  >
                    {['open', 'in progress', 'resolved', 'closed'].map(opt => (
                      <option key={opt} value={opt} className="bg-[#1e1e2f] text-white">
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
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

      {renderModal()}
    </div>
  );
}
