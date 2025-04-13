import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function VerticalBarChart() {
  const {borrowedStats} = useSelector((state)=>state.chart);
  const {visitorStats} = useSelector((state)=>state.chart)

  const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Visitors',
        data:visitorStats,
        backgroundColor: '#94152B',
      },
      {
        label: 'Borrowers',
        data: borrowedStats,
        backgroundColor: '#b1b1b1',
      },
    ],
  };

  return <Bar data={data} />;
}