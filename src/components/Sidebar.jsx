import React, { useContext, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaPlus, FaBox, FaSignOutAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext.jsx';

export default function Sidebar({ open, setOpen }) {
  const { user, logoutUser } = useContext(AuthContext);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside of it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setOpen]);

  const isITStaff = user?.groups?.includes('IT Staff') || user?.is_superuser;

  const baseLinkClass = 'flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-text-on-sidebar/70 hover:bg-sidebar-hover hover:text-text-on-sidebar';
  const activeLinkClass = 'bg-primary text-white';

  const sidebarClasses = `
    w-64 bg-sidebar flex-shrink-0 flex flex-col transition-transform duration-300 ease-in-out
    md:translate-x-0 fixed md:static h-full z-30
    ${open ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setOpen(false)}></div>}

      <aside ref={sidebarRef} className={sidebarClasses}>
        <div className="px-6 py-4 text-2xl font-bold border-b border-sidebar-hover text-white">
          NotifiQ
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
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
          <NavLink to="/tickets" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
            <FaTicketAlt className="mr-3" /> My Tickets
          </NavLink>
          <NavLink to="/tickets/create" className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
            <FaPlus className="mr-3" /> Create Ticket
          </NavLink>
        </nav>
        <div className="px-4 py-4 mt-auto border-t border-sidebar-hover">
          <div className="text-xs text-text-on-sidebar/50 mb-2 px-4">Logged in as: {user?.username}</div>
          <button onClick={logoutUser} className={`${baseLinkClass} w-full`}>
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}