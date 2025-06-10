import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
    throw new Error('Vite_API_URL not set');
}

export default function IncidentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_URL}/api/incidents/`);
        if (!resp.ok) {
          throw new Error(`Fetch failed: ${resp.status}`);
        }
        const data = await resp.json();
        setTickets(data);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Text color classes here
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'open': return 'text-yellow-400';
      case 'in progress': return 'text-blue-400';
      case 'resolved': return 'text-green-400';
      case 'closed': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  // Sorting handlers
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  const sortedTickets = React.useMemo(() => {
    return [...tickets].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      // Compare dates to Submitted_at
    
      if (sortKey === 'submitted_at') {
        const ad = new Date(aVal).getTime();
        const bd = new Date(bVal).getTime();
        if (isNaN(ad) || isNaN(bd)) {
          return 0;
        }
        return sortOrder === 'asc' ? ad - bd : bd - ad;
      }
      // Otherwise string compare
      const as = String(aVal);
      const bs = String(bVal);
      if (sortOrder === 'asc') return as.localeCompare(bs);
      else return bs.localeCompare(as);
    });
  }, [tickets, sortKey, sortOrder]);

  const handleChange = (id, key, value) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [key]: value } : t))
    );
  };

  // Modal for full ticket details
  const renderModal = () => {
    if (!selectedTicket) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-[#1e1e2f] text-white p-6 rounded-lg w-full max-w-lg relative shadow-lg">
          <button
            onClick={() => setSelectedTicket(null)}
            className="absolute top-2 right-3 text-2xl font-bold text-gray-400 hover:text-white"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4">Ticket #{selectedTicket.id} Details</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Title:</span> {selectedTicket.title}</p>
            <p><span className="font-semibold">Email:</span> {selectedTicket.email || 'N/A'}</p>
            <p><span className="font-semibold">Description:</span></p>
            <p className="whitespace-pre-wrap bg-[#2b2b3d] p-2 rounded">{selectedTicket.description}</p>
            <p><span className="font-semibold">Priority:</span> {selectedTicket.priority}</p>
            <p><span className="font-semibold">Status:</span> {selectedTicket.status}</p>
            <p>
              <span className="font-semibold">Submitted:</span>{' '}
              {selectedTicket.submitted_at
                ? new Date(selectedTicket.submitted_at).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#111025] text-white">
      {/* <Sidebar /> */}

      <div className="flex-1 p-4 md:p-8">
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
                      {/* avatar/initial */}
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white font-semibold text-sm">
                        {ticket.title?.charAt(0).toUpperCase() || '?'}
                      </span>
                      {ticket.title}
                    </td>
                    <td className="px-4 py-2">{ticket.email || '-'}</td>
                    <td className="px-4 py-2 capitalize">
                      <select
                        value={ticket.priority}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleChange(ticket.id, 'priority', e.target.value);
                        }}
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
                        onChange={(e) => {
                          e.stopPropagation();
                          handleChange(ticket.id, 'status', e.target.value);
                        }}
                        className="bg-transparent outline-none"
                      >
                        <option value="open">Open</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {ticket.submitted_at
                        ? new Date(ticket.submitted_at).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {renderModal()}
      </div>
    </div>
  );
}
