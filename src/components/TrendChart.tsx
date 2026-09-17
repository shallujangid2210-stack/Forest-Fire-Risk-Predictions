import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface TrendChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
  title?: string;
  yAxisLabel?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ labels, datasets, title, yAxisLabel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy prior instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map(ds => ({
          ...ds,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: ds.borderColor,
          tension: ds.tension ?? 0.35,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' }
            }
          },
          title: {
            display: !!title,
            text: title,
            color: '#f1f5f9',
            font: { family: 'Outfit', size: 14, weight: 'bold' }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#38bdf8',
            bodyColor: '#f8fafc',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { color: '#94a3b8', font: { size: 11 } }
          },
          y: {
            title: {
              display: !!yAxisLabel,
              text: yAxisLabel,
              color: '#94a3b8'
            },
            grid: { color: 'rgba(51, 65, 85, 0.4)' },
            ticks: { color: '#94a3b8', font: { size: 11 } },
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [labels, datasets, title, yAxisLabel]);

  return (
    <div className="w-full h-full min-h-[220px]">
      <canvas ref={canvasRef} />
    </div>
  );
};
