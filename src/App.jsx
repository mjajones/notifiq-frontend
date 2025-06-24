import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Component
import Layout from './components/Layout';

// Page Components
import Dashboard from './pages/Dashboard';
import CurrentTickets from './pages/CurrentTickets';
import TicketForm from './pages/TicketForm';
import TicketDetail from './pages/TicketDetail';
import AssetForm from './pages/AssetForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';

// Route Guard Components
import PrivateRoute from './utils/PrivateRoute';
import ITStaffRoute from './utils/ITStaffRoute';


function App() {
  return (
    <Routes>
      {/* Public routes that anyone can access */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email/:uidb64/:token" element={<VerifyEmailPage />} />
      <Route path="/registration-success" element={<RegistrationSuccessPage />} />

      {/* This main route ensures a user is logged in for any of the main app pages */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          
          {/* Routes for ALL logged-in users */}
          <Route path="tickets" element={<CurrentTickets />} />
          <Route path="tickets/create" element={<TicketForm />} />
          <Route path="tickets/:ticketId" element={<TicketDetail />} />
          
          {/* Routes for ONLY IT Staff, protected by the ITStaffRoute guard */}
          <Route element={<ITStaffRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets/create" element={<AssetForm />} />
          </Route>

          {/* Default redirect for logged-in users */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
        </Route>
      </Route>

      {/* Catch-all for any other routes */}
      <Route path="*" element={<div className="p-6">Page not found</div>} />
    </Routes>
  );
}

export default App;