import React, { useEffect, useState, useContext } from 'react';
import StatsCard from '../components/StatsCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import AuthContext from '../context/AuthContext.jsx';
import dayjs from 'dayjs';
import NewTicketsChart from '../components/NewTicketsChart.jsx';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authTokens, user } = useContext(AuthContext);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchTickets = async () => {
      if (!authTokens) {
        setLoading(false);
        return;
      }
      try {
        const resp = await fetch(`${API_URL}/api/incidents/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authTokens.access}` 
          }
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const results = data.results || (Array.isArray(data) ? data : []);
        setTickets(results);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [authTokens]);

  // UPDATED: Filtering logic now checks ticket.status.name
  const unresolvedTickets = tickets.filter(t => t.status && !['resolved', 'closed'].includes(t.status.name?.toLowerCase()));
  
  const now = dayjs();
  const overdueCount = unresolvedTickets.filter(t => t.due_date && dayjs(t.due_date).isBefore(now, 'day')).length;
  const dueTodayCount = unresolvedTickets.filter(t => t.due_date && dayjs(t.due_date).isSame(now, 'day')).length;
  const openCount = unresolvedTickets.filter(t => t.status?.name?.toLowerCase() === 'open').length;
  const onHoldCount = unresolvedTickets.filter(t => t.status?.name?.toLowerCase() === 'on hold').length;
  const unassignedCount = tickets.filter(t => !t.agent).length;
  const watchingCount = 0;

  const priorityBuckets = ['Low', 'Medium', 'High', 'Urgent'];
  const priorityCounts = priorityBuckets.map(p => unresolvedTickets.filter(t => t.priority === p).length);
  const priorityColors = [
      { light: '#93c5fd', dark: '#3b82f6' }, { light: '#fcd34d', dark: '#f59e0b' },
      { light: '#fca5a5', dark: '#ef4444' }, { light: '#f87171', dark: '#b91c1c' }
  ];

  const statusBuckets = Array.from(new Set(unresolvedTickets.map(t => t.status?.name).filter(Boolean)));
  const statusCounts = statusBuckets.map(s => unresolvedTickets.filter(t => t.status?.name === s).length);
  const statusColors = unresolvedTickets.map(t => ({ light: t.status?.color, dark: t.status?.color }));

  const myOpenCount = user ? unresolvedTickets.filter(t => t.agent === user.user_id).length : 0;
  const newTicketsCount = tickets.filter(t => dayjs(t.submitted_at).isAfter(now.subtract(7, 'day'))).length;
  const newAndMyOpenData = [
      { label: 'New (last 7d)', value: newTicketsCount, color: 'linear-gradient(to right, #a5b4fc, #6366f1)'},
      { label: 'My Open Tickets', value: myOpenCount, color: 'linear-gradient(to right, #93c5fd, #3b82f6)'},
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
      </div>

      {loading ? (
        <p className="text-text-secondary">Loading dashboard data...</p>
      ) : error ? (
        <p className="text-red-500">Error loading data: {error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <StatsCard label="Overdue Tickets" count={overdueCount} />
            <StatsCard label="Tickets Due Today" count={dueTodayCount} />
            <StatsCard label="Open Tickets" count={openCount} />
            <StatsCard label="Tickets On Hold" count={onHoldCount} />
            <StatsCard label="Unassigned Tickets" count={unassignedCount} />
            <StatsCard label="Tickets I'm Watching" count={watchingCount} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Unresolved Tickets by Priority" type="doughnut" labels={priorityBuckets} data={priorityCounts} colors={priorityColors} />
            <ChartCard title="Unresolved Tickets by Status" type="doughnut" labels={statusBuckets} data={statusCounts} colors={statusColors} />
            <NewTicketsChart title="New & My Open Tickets" data={newAndMyOpenData} />
          </div>
        </>
      )}
    </>
  );
}