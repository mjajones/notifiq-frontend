import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CurrentTickets from './pages/CurrentTickets';
import TicketForm from './pages/TicketForm';
import CustomerTicketForm from './pages/CustomerTicketForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<CurrentTickets />} />
        <Route path="tickets/create" element={<TicketForm />} />
      </Route>
      {/* Public/Customer route without sidebar, e.g. */}
      <Route path="/submit-ticket" element={<CustomerTicketForm />} />
      {/* 404 fallback */}
      <Route path="*" element={<div className="p-6 text-white">Page not found</div>} />
    </Routes>
  );
}

export default App;