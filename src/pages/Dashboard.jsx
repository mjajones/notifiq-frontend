import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import Chart from 'chart.js/auto'; 
import { Bar, Doughnut } from 'react-chartjs-2';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

// --- Reusable Stats Card Component ---
const StatsCard = ({ label, value, large = false }) => (
    <div className="bg-foreground p-4 rounded-lg border border-border shadow-sm">
        <div className="text-sm font-medium text-text-secondary">{label}</div>
        <div className={`mt-1 font-bold ${large ? 'text-4xl' : 'text-3xl'} text-text-primary`}>{value}</div>
    </div>
);

// --- New Ticket List Component ---
const TicketList = ({ title, tickets, employees }) => {
    const getAgentInfo = (agentId) => {
        if (!agentId) return { name: 'Unassigned', initials: '-' };
        const agent = employees.find(emp => emp.id === agentId);
        if (!agent) return { name: 'Unknown', initials: '?' };
        const initials = `${agent.first_name?.[0] || ''}${agent.last_name?.[0] || ''}`.toUpperCase();
        return { name: `${agent.first_name} ${agent.last_name}`, initials };
    };

    const getSlaTime = (dueDate) => {
        if (!dueDate) return { text: 'N/A', color: 'bg-gray-400' };
        const now = dayjs();
        const due = dayjs(dueDate);
        const diff = due.diff(now);
        const dur = dayjs.duration(diff);
        const isBreached = diff < 0;

        const hours = Math.abs(Math.floor(dur.asHours()));
        const minutes = Math.abs(dur.minutes());
        
        const timeText = `${isBreached ? '-' : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        if (isBreached) return { text: timeText, color: 'bg-red-500' };
        if (dur.asHours() < 24) return { text: timeText, color: 'bg-yellow-500' };
        return { text: timeText, color: 'bg-green-500' };
    };
    
    return (
        <div className="bg-foreground p-4 rounded-lg border border-border shadow-sm col-span-12 lg:col-span-7">
            <h3 className="font-semibold text-text-primary mb-4">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Summary</th>
                            <th className="px-4 py-3">Agent</th>
                            <th className="px-4 py-3">Priority</th>
                            <th className="px-4 py-3 text-right">Resolution Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => {
                            const agentInfo = getAgentInfo(ticket.agent);
                            const sla = getSlaTime(ticket.due_date);
                            return (
                                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-400">{ticket.id}</td>
                                    <td className="px-4 py-3">
                                        <Link to={`/tickets/${ticket.id}`} className="font-medium text-primary hover:underline">{ticket.title}</Link>
                                    </td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-600" title={agentInfo.name}>
                                            {agentInfo.initials}
                                        </div>
                                        <span>{agentInfo.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{ticket.priority}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`text-white text-xs font-bold px-2 py-1 rounded-md ${sla.color}`}>{sla.text}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authTokens, user } = useContext(AuthContext);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const fetchData = async () => {
            if (!authTokens) return;
            try {
                const [ticketsRes, usersRes] = await Promise.all([
                    fetch(`${API_URL}/api/incidents/`, { headers: { 'Authorization': `Bearer ${authTokens.access}` } }),
                    fetch(`${API_URL}/api/users/`, { headers: { 'Authorization': `Bearer ${authTokens.access}` } })
                ]);
                const ticketsData = await ticketsRes.json();
                const usersData = await usersRes.json();

                setTickets(Array.isArray(ticketsData.results) ? ticketsData.results : []);
                setEmployees(Array.isArray(usersData.results) ? usersData.results : []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authTokens, API_URL]);

    const stats = useMemo(() => {
        const openTickets = tickets.filter(t => t.status?.name !== 'Resolved' && t.status?.name !== 'Closed');
        
        // NOTE: These calculations require backend model changes to be accurate.
        const avgResponseTime = '1.01'; 
        const avgResolutionTime = '2.01'; 

        return {
            openCount: openTickets.length,
            resolvedCount: tickets.filter(t => t.status?.name === 'Resolved').length,
            majorCount: tickets.filter(t => t.priority === 'High' || t.priority === 'Urgent').length,
            unassignedCount: tickets.filter(t => !t.agent).length,
            avgResponseTime,
            avgResolutionTime,
        };
    }, [tickets]);

    const chartData = useMemo(() => {
        // Data for "Open Incidents by IT Staff"
        const openByAgent = tickets
            .filter(t => t.status?.name !== 'Resolved' && t.status?.name !== 'Closed' && t.agent)
            .reduce((acc, ticket) => {
                const agentName = employees.find(e => e.id === ticket.agent)?.first_name || 'Unknown';
                acc[agentName] = (acc[agentName] || 0) + 1;
                return acc;
            }, {});

        // Data for "Incidents by Category"
        const byCategory = tickets.reduce((acc, ticket) => {
            const key = `${ticket.category || 'N/A'} > ${ticket.subcategory || 'N/A'}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        
        return {
            agent: {
                labels: Object.keys(openByAgent),
                datasets: [{ label: 'Open Tickets', data: Object.values(openByAgent), backgroundColor: '#3b82f6' }]
            },
            category: {
                labels: Object.keys(byCategory),
                datasets: [{ data: Object.values(byCategory) }]
            }
        };
    }, [tickets, employees]);
    
    const sortedTickets = useMemo(() => 
        [...tickets].sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at))
    , [tickets]);

    if (loading) return <p className="p-8 text-text-secondary">Loading dashboard...</p>;
    if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Good afternoon, {user.first_name || user.username}</h1>
                    <p className="text-text-secondary">{user.first_name} {user.last_name} &bull; {user.email}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-text-primary">{dayjs().format('M/D/YYYY')}</p>
                    <p className="text-text-secondary">{dayjs().format('h:mm A')}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <StatsCard label="Open Incidents" value={stats.openCount} large />
                <StatsCard label="Resolved Incidents" value={stats.resolvedCount} large />
                <StatsCard label="Major Incidents" value={stats.majorCount} large />
                <StatsCard label="Unassigned Incidents" value={stats.unassignedCount} large />
                <StatsCard label="Average Response Time (hrs)" value={stats.avgResponseTime} large />
                <StatsCard label="Average Resolution Time (hrs)" value={stats.avgResolutionTime} large />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <TicketList title="All Tickets" tickets={sortedTickets} employees={employees} />
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-foreground p-4 rounded-lg border border-border shadow-sm">
                        <h3 className="font-semibold text-text-primary mb-4">Open Incidents by IT Staff</h3>
                        <Bar data={chartData.agent} options={{ responsive: true }} />
                    </div>
                     <div className="bg-foreground p-4 rounded-lg border border-border shadow-sm">
                        <h3 className="font-semibold text-text-primary mb-4">Incidents by Category</h3>
                        <Doughnut data={chartData.category} options={{ responsive: true }} />
                    </div>
                </div>
            </div>
        </div>
    );
}