import React, { useEffect, useState, useContext } from 'react';
import StatsCard from '../components/StatsCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import AuthContext from '../context/AuthContext.jsx';
import dayjs from 'dayjs';
import NewTicketsChart from '../components/NewTicketsChart.jsx'; // Import the new component

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authTokens, user } = useContext(AuthContext); // Get user from context

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

  // --- Data Calculations ---
  const now = dayjs();
  const unresolvedTickets = tickets.filter(t => t.status && !['resolved', 'closed'].includes(t.status.toLowerCase()));
  
  const overdueCount = unresolvedTickets.filter(t => t.due_date && dayjs(t.due_date).isBefore(now, 'day')).length;
  const dueTodayCount = unresolvedTickets.filter(t => t.due_date && dayjs(t.due_date).isSame(now, 'day')).length;
  const openCount = unresolvedTickets.filter(t => t.status && t.status.toLowerCase() === 'open').length;
  const onHoldCount = unresolvedTickets.filter(t => t.status && t.status.toLowerCase() === 'on hold').length;
  const unassignedCount = tickets.filter(t => !t.agent).length;
  const watchingCount = 0;

  // Priority Chart Data
  const priorityBuckets = ['Low', 'Medium', 'High', 'Urgent'];
  const priorityCounts = priorityBuckets.map(p => unresolvedTickets.filter(t => t.priority === p).length);
  const priorityColors = ['#3b82f6', '#f59e0b', '#ef4444', '#b91c1c']; // Blue, Amber, Red, Dark Red

  // Status Chart Data
  const statusBuckets = Array.from(new Set(unresolvedTickets.map(t => t.status)));
  const statusCounts = statusBuckets.map(s => unresolvedTickets.filter(t => t.status === s).length);
  const statusColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7']; // Blue, Indigo, Purple, Violet

  // New & My Open Tickets Chart Data
  const myOpenCount = user ? unresolvedTickets.filter(t => t.agent === user.user_id).length : 0;
  const newTicketsData = [
      { label: 'Low', value: unresolvedTickets.filter(t => t.priority === 'Low').length, color: 'linear-gradient(to right, #fbcfe8, #f472b6)'}, // Pink
      { label: 'Medium', value: unresolvedTickets.filter(t => t.priority === 'Medium').length, color: 'linear-gradient(to right, #d8b4fe, #a855f7)'}, // Purple
      { label: 'High', value: unresolvedTickets.filter(t => t.priority === 'High').length, color: 'linear-gradient(to right, #a5b4fc, #6366f1)'}, // Indigo
      { label: 'Urgent', value: unresolvedTickets.filter(t => t.priority === 'Urgent').length, color: 'linear-gradient(to right, #93c5fd, #3b82f6)'}, // Blue
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
            <NewTicketsChart data={newTicketsData} />
          </div>
        </>
      )}
    </>
  );
}