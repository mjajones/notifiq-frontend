import React from 'react';

export default function StatsCard({ label, count, className = '' }) {
  return (
    <div className={`bg-base-200 p-4 rounded-lg shadow-md ${className}`}>
      <div className="text-sm font-medium text-content-secondary">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-content-primary">{count}</div>
    </div>
  );
}