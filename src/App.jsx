import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CurrentTickets from './pages/CurrentTickets';
import TicketForm from './pages/TicketForm';
import CustomerTicketForm from './pages/CustomerTicketForm';

export default function App() {
  return (
    <Routes>
      {/* Redirect for customer form */}
      <Route index element={<Navigate to="/submit-ticket" replace />} />

      {/* Customer ticket submission by iteself */}
      <Route path="submit-ticket" element={<CustomerTicketForm />} />

      {/* Internal IT helpdesk pages */}
      <Route element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<CurrentTickets />} />
        <Route path="create-ticket" element={<TicketForm />} />
      </Route>

      {/* Redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}