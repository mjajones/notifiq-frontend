// src/components/ChartCard.jsx
import React from 'react';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

// Register of required compoinents
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ChartCard({
  title,
  type = 'doughnut', 
  labels = [],
  data = [],
  colors = [],       
  borderColors = [], 
}) {
  const hasData =
    Array.isArray(data) &&
    data.length > 0 &&
    data.some((v) => typeof v === 'number' && v > 0);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: borderColors.length ? borderColors : colors.map((c) => '#1e1e2f'),
        borderWidth: 1,
      },
    ],
  };

  const commonOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.8)',
        },
      },
      tooltip: {
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="flex flex-col bg-gray-800 text-white rounded-lg p-4 shadow min-h-[240px]">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex-1 flex items-center justify-center">
        {hasData ? (
          <div className="w-full h-48">
            {type === 'doughnut' && <Doughnut data={chartData} options={commonOptions} />}
            {type === 'pie' && <Pie data={chartData} options={commonOptions} />}
            {type === 'bar' && <Bar data={chartData} options={commonOptions} />}
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="mb-2">No data to display</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-6m4 6V9m4 8v-4M4 21h16M4 3v4m16-4v4"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
