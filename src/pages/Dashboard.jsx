import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/incidents/');
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getCountByStatus = (status) =>
    tickets.filter((ticket) => ticket.status.toLowerCase() === status).length;

  const getCountByPriority = (priority) =>
    tickets.filter((ticket) => ticket.priority.toLowerCase() === priority).length;

  if (loading) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-600 rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold">Open Tickets</h2>
          <p className="text-3xl mt-2">{getCountByStatus('open')}</p>
        </div>
        <div className="bg-yellow-600 rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold">In Progress</h2>
          <p className="text-3xl mt-2">{getCountByStatus('in progress')}</p>
        </div>
        <div className="bg-green-600 rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold">Resolved</h2>
          <p className="text-3xl mt-2">{getCountByStatus('resolved')}</p>
        </div>
        <div className="bg-red-600 rounded-lg shadow p-5">
          <h2 className="text-xl font-semibold">High Priority</h2>
          <p className="text-3xl mt-2">{getCountByPriority('high')}</p>
        </div>
      </div>
    </div>
  );
}

