import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaListAlt, FaPlusCircle } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="px-6 py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">NotifiQ</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? 'bg-gray-700' : ''
            }`
          }
        >
          <FaTachometerAlt className="mr-3" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/tickets"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? 'bg-gray-700' : ''
            }`
          }
        >
          <FaListAlt className="mr-3" />
          <span>Tickets</span>
        </NavLink>

        <NavLink
          to="/create-ticket"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
              isActive ? 'bg-gray-700' : ''
            }`
          }
        >
          <FaPlusCircle className="mr-3" />
          <span>Create Ticket</span>
        </NavLink>
      </nav>
    </aside>
  );
}