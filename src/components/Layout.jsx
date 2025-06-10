import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <main className="flex-1 bg-[#1e1e2f] text-white overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}