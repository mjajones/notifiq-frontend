import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaPlus, FaBox, FaSignOutAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { user, logoutUser } = useContext(AuthContext); // Get the full user object
  const navigate = useNavigate();

  console.log('User object from context:', user);
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Check if IT
  const isITStaff = user && user.groups && user.groups.includes('IT Staff');

  const baseLinkClass = 'flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-text-on-sidebar/70 hover:bg-sidebar-hover hover:text-text-on-sidebar';
  const activeLinkClass = 'bg-primary text-white';

  return (
    <aside className="w-64 bg-sidebar flex-shrink-0 flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold border-b border-sidebar-hover text-white">
        NotifiQ
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {/* For IT */}
        {isITStaff && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
              <FaHome className="mr-3" /> Dashboard
            </NavLink>
            <NavLink to="/assets/create" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
              <FaBox className="mr-3" /> Assets
            </NavLink>
          </>
        )}

        {/* For everyone */}
        <NavLink to="/tickets" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
          <FaTicketAlt className="mr-3" /> My Tickets
        </NavLink>
        <NavLink to="/tickets/create" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
          <FaPlus className="mr-3" /> Create Ticket
        </NavLink>
      </nav>

      <div className="px-4 py-4 mt-auto border-t border-sidebar-hover">
        <div className="text-xs text-text-on-sidebar/50 mb-2 px-4">Logged in as: {user?.username}</div>
        <button onClick={handleLogout} className={`${baseLinkClass} w-full`}>
          <FaSignOutAlt className="mr-3" /> Logout
        </button>
      </div>
    </aside>
  );
}