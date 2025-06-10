import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaPlus } from 'react-icons/fa';

export default function Sidebar() {
  const navLinkClass =
    'flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors ' +
    'text-content-secondary hover:text-content-primary hover:bg-base-100 ' +
    'data-[active=true]:bg-accent data-[active=true]:text-white';

  return (
    <aside className="w-64 bg-base-300 text-white flex-shrink-0 flex flex-col">
      <div className="px-6 py-4 text-2xl font-bold border-b border-base-100">
        NotifiQ
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        <NavLink to="/dashboard" className={({isActive}) => navLinkClass} data-active={isActive}>
          <FaHome className="mr-3" /> Dashboard
        </NavLink>
        <NavLink to="/tickets" className={({isActive}) => navLinkClass} data-active={isActive}>
          <FaTicketAlt className="mr-3" /> Tickets
        </NavLink>
        <NavLink to="/tickets/create" className={({isActive}) => navLinkClass} data-active={isActive}>
          <FaPlus className="mr-3" /> Create Ticket
        </NavLink>
      </nav>
    </aside>
  );
}