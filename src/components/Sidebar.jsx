import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaPlus, FaBox, FaSignOutAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
  };

  const isITStaff = user?.groups?.includes('IT Staff') || user?.is_superuser;

  const baseLinkClass = 'flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-text-on-sidebar/70 hover:bg-sidebar-hover hover:text-text-on-sidebar';
  const activeLinkClass = 'bg-primary text-white';

  return (
    <aside className="w-64 bg-sidebar flex-shrink-0 flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold border-b border-sidebar-hover text-white">
        NotifiQ
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        
        {/* Links - IT staff */}
        {isITStaff && (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `${baseLinkclass} ${isActive ? activeLinkClass : ''}`}>
              <FaHome className="mr-3" /> Dashboard
            </NavLink>
            <NavLink to="/assets/create" className={({ isActive }) => `${baseLinkclass} ${isActive ? activeLinkClass : ''}`}>
              <FaBox className="mr-3" /> Assets
            </NavLink>
          </>
        )}

        {/* Links - logged in users */}
        <NavLink to="/tickets" className={({ isActive }) => `${baseLinkclass} ${isActive ? activeLinkClass : ''}`}>
          <FaTicketAlt className="mr-3" /> My Tickets
        </NavLink>
        <NavLink to="/tickets/create" className={({ isActive }) => `${baseLinkclass} ${isActive ? activeLinkClass : ''}`}>
          <FaPlus className="mr-3" /> Create Ticket
        </NavLink>
      </nav>

      {/* User info / logout button */}
      <div className="px-4 py-4 mt-auto border-t border-sidebar-hover">
        <div className="text-xs text-text-on-sidebar/50 mb-2 px-4">Logged in as: {user?.username}</div>
        <button onClick={handleLogout} className={`${baseLinkClass} w-full`}>
          <FaSignOutAlt className="mr-3" /> Logout
        </button>
      </div>
    </aside>
  );
}