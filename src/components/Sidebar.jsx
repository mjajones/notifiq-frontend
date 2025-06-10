import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaPlus } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gray-800 text-gray-200 flex flex-col">
      <div className="px-4 py-6 text-2xl font-bold border-b border-gray-700">
        NotifiQ
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${
              isActive ? 'bg-gray-700 text-white' : 'text-gray-300'
            }`
          }
        >
          <FaHome className="mr-2" /> Dashboard
        </NavLink>
        <NavLink
          to="/tickets"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${
              isActive ? 'bg-gray-700 text-white' : 'text-gray-300'
            }`
          }
        >
          <FaTicketAlt className="mr-2" /> Tickets
        </NavLink>
        <NavLink
          to="/tickets/create"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded hover:bg-gray-700 ${
              isActive ? 'bg-gray-700 text-white' : 'text-gray-300'
            }`
          }
        >
          <FaPlus className="mr-2" /> Create Ticket
        </NavLink>
      </nav>
    </aside>
  );
}