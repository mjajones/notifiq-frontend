import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar on the left */}
      <aside className="w-60 bg-gray-800 text-white">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 bg-[#1e1e2f] text-white overflow-auto">
        <header className="py-4 px-6 border-b border-gray-600">
          <h1 className="text-2xl font-bold text-center">NotifiQ</h1>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}