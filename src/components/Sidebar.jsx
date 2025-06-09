import React, { useState } from 'react';
import { FaTachometerAlt, FaTicketAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-16 sm:w-48 bg-gray-900 text-white h-screen flex flex-col">
      <div className="text-center font-bold text-lg py-4 border-b border-gray-700">NotifiQ</div>
      <NavLink to="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800" activeclassname="bg-gray-800">
        <FaTachometerAlt />
        <span className="hidden sm:inline">Dashboard</span>
      </NavLink>
      <NavLink to="/tickets" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800" activeclassname="bg-gray-800">
        <FaTicketAlt />
        <span className="hidden sm:inline">Tickets</span>
      </NavLink>
    </div>
  );
}