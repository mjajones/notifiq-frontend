// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch
  const API_URL = import.meta.env.VITE_API_URL || 'https://notifiq-backend-production.up.railway.app';

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const resp = await fetch(`${API_URL}/api/incidents/`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setTickets(data);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [API_URL]);

  // Helpers to parse/compute:
  const now = dayjs();


  const overdueCount = tickets.filter((t) => {
    if (!t.due_date) return false;
    return dayjs(t.due_date).isBefore(now, 'day') && t.status !== 'resolved' && t.status !== 'closed';
  }).length;

  const dueTodayCount = tickets.filter((t) => {
    if (!t.due_date) return false;
    return dayjs(t.due_date).isSame(now, 'day');
  }).length;

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const onHoldCount = tickets.filter((t) => t.status === 'on hold').length; // adjust if your statuses differ
  const unassignedCount = tickets.filter((t) => !t.agent).length;
  // For "Tickets I'm Watching" used t.watching
  const currentUser = 'mjj0'; 
  const watchingCount = tickets.filter((t) => {
    if (!Array.isArray(t.watching_by)) return false;
    return t.watching_by.includes(currentUser);
  }).length;

  // Chart data: Unresolved by Priority
  const priorityBuckets = ['high', 'medium', 'low'];
  const priorityCounts = priorityBuckets.map((p) =>
    tickets.filter((t) => t.priority === p && t.status !== 'resolved' && t.status !== 'closed').length
  );
  // Chart data: Unresolved by Status
  const statusBuckets = Array.from(new Set(tickets.map((t) => t.status)));
  const statusCounts = statusBuckets.map((s) =>
    tickets.filter((t) => t.status === s && t.status !== 'resolved' && t.status !== 'closed').length
  );
  // Chart data: New & My Open Tickets
  const sevenDaysAgo = now.subtract(7, 'day');
  const newOpenCount = tickets.filter((t) => {
    if (!t.submitted_at) return false;
    return dayjs(t.submitted_at).isAfter(sevenDaysAgo) && t.status === 'open';
  }).length;
  const myOpenCount = tickets.filter((t) => t.agent === currentUser && t.status === 'open').length;

  // Colors for prior chart: high=red, medium=yellow, low=green
  const priorityColors = ['#dc2626', '#f59e0b', '#10b981'];
  // Status chart colors
  const statusColors = statusBuckets.map((s, idx) => {
    const key = s.toLowerCase();
    if (key === 'open') return '#fbbf24';
    if (key === 'in progress') return '#3b82f6';
    if (key === 'on hold') return '#f97316';
    if (key === 'pending') return '#6366f1';
    // fallback gray
    return '#9ca3af';
  });

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">

      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        {/* Header / Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold border-b border-gray-600 pb-2">All Tickets</h1>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-400">Error: {error}</p>
        ) : (
          <>
            {/* Top summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatsCard
                    label="Overdue Tickets"
                    count={overdueCount}
                    // Use the 'error' color from your theme if count > 0
                    className={overdueCount > 0 ? 'text-error' : ''}
                />
                <StatsCard
                    label="Tickets Due Today"
                    count={dueTodayCount}
                    // Use the 'warning' color from your theme if count > 0
                    className={dueTodayCount > 0 ? 'text-warning' : ''}
                />
                <StatsCard
                    label="Open Tickets"
                    count={openCount}
                />
                <StatsCard
                    label="Tickets On Hold"
                    count={onHoldCount}
                />
                <StatsCard
                    label="Unassigned Tickets"
                    count={unassignedCount}
                    // Use the 'accent' color from your theme
                    className="text-accent"
                />
                <StatsCard
                    label="Tickets I'm Watching"
                    count={watchingCount}
                />
            </div>

            {/* Chart area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ChartCard
                title="Unresolved Tickets by Priority"
                type="doughnut"
                labels={priorityBuckets.map((p) => p.charAt(0).toUpperCase() + p.slice(1))}
                data={priorityCounts}
                colors={priorityColors}
              />
              <ChartCard
                title="Unresolved Tickets by Status"
                type="doughnut"
                labels={statusBuckets.map((s) => s.charAt(0).toUpperCase() + s.slice(1))}
                data={statusCounts}
                colors={statusColors}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ChartCard
                title="New & My Open Tickets"
                type="bar"
                labels={['New (7d)', 'My Open']}
                data={[newOpenCount, myOpenCount]}
                colors={['#3b82f6', '#10b981']}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
