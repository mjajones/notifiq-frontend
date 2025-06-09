import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function() {
    return(
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* This is for my sidebar! */}
      <aside className="w-64 bg-gray-800 p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-4">NotifiQ</h1>
        <nav className="flex flex-col space-y-2">
          <Link to="/dashboard" className="hover:bg-gray-700 p-2 rounded">📊 Dashboard</Link>
          <Link to="/tickets" className="hover:bg-gray-700 p-2 rounded">🎫 Tickets</Link>
        </nav>
      </aside>

      {/* Main area! */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet /> {/*  For my nested content. */}
      </main>
    </div>
  );
}