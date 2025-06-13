import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CurrentTickets from './pages/CurrentTickets';
import TicketForm from './pages/TicketForm';
import CustomerTicketForm from './pages/CustomerTicketForm';
import AssetForm from './pages/AssetForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './utils/PrivateRoute';

function App() {
  return (
    <Routes>
      {/* My public routes for login and reg */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Private routes for main app */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tickets" element={<CurrentTickets />} />
          <Route path="tickets/create" element={<TicketForm />} />
          <Route path="assets/create" element={<AssetForm />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-6">Page not found</div>} />
    </Routes>
  );
}

export default App;