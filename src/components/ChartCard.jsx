import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ChartCard({
  title,
  type = 'doughnut', 
  labels = [],
  data = [],
  colors = [],       
}) {
  const hasData = Array.isArray(data) && data.length > 0 && data.some((v) => v > 0);
  const totalTickets = data.reduce((sum, value) => sum + value, 0);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors.map(() => '#ffffff'), // White border for segments
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6B7280', // text-secondary
          boxWidth: 12,
          padding: 20,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
  };

  const barOptions = {
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    }
  };

  return (
    <div className="bg-foreground rounded-lg border border-border p-4 shadow-sm min-h-[300px] flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <div className="flex-1 flex items-center justify-center relative mt-4">
        {hasData ? (
          <>
            <div className="w-full h-full">
              {type === 'doughnut' && <Doughnut data={chartData} options={doughnutOptions} />}
              {type === 'bar' && <Bar data={chartData} options={barOptions} />}
            </div>
            {type === 'doughnut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-text-primary">{totalTickets}</span>
                <span className="text-sm text-text-secondary">tickets</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400">
            <span>No data to display</span>
          </div>
        )}
      </div>
    </div>
  );
}
