import React from 'react';

export default function StatsCard({ label, count, bgColor = 'bg-white', textColor = 'text-black' }) {
  return (
    <div className={`flex-1 min-w-[150px] p-4 rounded-lg shadow ${bgColor}`}>
      <div className="text-sm font-medium">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${textColor}`}>{count}</div>
    </div>
  );
}