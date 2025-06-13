import React, { useEffect, useState, useContext } from 'react';
import StatsCard from '../components/StatsCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import AuthContext from '../context/AuthContext.jsx';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authTokens } = useContext(AuthContext);

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
        
        // For my responses
        if (data && Array.isArray(data.results)) {
            setTickets(data.results);
        } else if (Array.isArray(data)) {
            setTickets(data);
        } else {
            setTickets([]);
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [authTokens]);

  // data calcs and jsks
  const now = dayjs();
  const overdueCount = tickets.filter((t) => t.due_date && dayjs(t.due_date).isBefore(now, 'day') && t.status !== 'resolved' && t.status !== 'closed').length;
  const dueTodayCount = tickets.filter((t) => t.due_date && dayjs(t.due_date).isSame(now, 'day')).length;
  const openCount = tickets.filter((t) => t.status && t.status.toLowerCase() === 'open').length;
  const onHoldCount = tickets.filter((t) => t.status && t.status.toLowerCase() === 'on hold').length;
  const unassignedCount = tickets.filter((t) => !t.agent).length;
  const watchingCount = 0; // watching logic
  const priorityBuckets = ['High', 'Medium', 'Low', 'Urgent'];
  const priorityCounts = priorityBuckets.map((p) => tickets.filter((t) => t.priority === p && t.status !== 'resolved' && t.status !== 'closed').length);
  const statusBuckets = Array.from(new Set(tickets.map((t) => t.status)));
  const statusCounts = statusBuckets.map((s) => tickets.filter((t) => t.status === s && t.status !== 'resolved' && t.status !== 'closed').length);
  const sevenDaysAgo = now.subtract(7, 'day');
  const newOpenCount = tickets.filter((t) => dayjs(t.submitted_at).isAfter(sevenDaysAgo) && t.status === 'open').length;
  const myOpenCount = 0; // agent specific logic
  const priorityColors = ['#EF4444', '#F59E0B', '#10B981', '#B91C1C'];
  const statusColors = statusBuckets.map(() => `#${Math.floor(Math.random()*16777215).toString(16)}`);


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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Unresolved Tickets by Priority" type="doughnut" labels={priorityBuckets} data={priorityCounts} colors={priorityColors} />
            <ChartCard title="Unresolved Tickets by Status" type="doughnut" labels={statusBuckets} data={statusCounts} colors={statusColors} />
            <ChartCard title="New & My Open Tickets" type="bar" labels={['New (7d)', 'My Open']} data={[newOpenCount, myOpenCount]} colors={['#3b82f6', '#10b981']} />
          </div>
        </>
      )}
    </>
  );
}