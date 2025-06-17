import React from 'react';

const ProgressBar = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-text-secondary">{label}</span>
            <span className="text-sm font-bold text-text-primary">{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            {value > 0 ? (
                <div className="h-2.5 rounded-full" style={{ width: '100%', background: color }}></div>
            ) : (
                <div className="h-2.5 rounded-full bg-gray-200"></div>
            )}
        </div>
    </div>
);

export default function NewTicketsChart({ title, data }) {
    return (
        <div className="bg-foreground rounded-lg border border-border p-4 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {data.map((item) => (
              <ProgressBar key={item.label} label={item.label} value={item.value} color={item.color} />
            ))}
          </div>
        </div>
      );
}