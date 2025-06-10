import React from 'react';

export default function StatsCard({ label, count }) {
  return (
    // Use 'foreground' for the white background and 'border' for the border
    <div className="bg-foreground p-5 rounded-lg border border-border shadow-sm">
      <div className="text-sm font-medium text-text-secondary">{label}</div>
      <div className="mt-1 text-3xl font-bold text-text-primary">{count}</div>
    </div>
  );
}