import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { PageLoader, PageHeader } from '../../components/common';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AnalyticsDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const { monthlyRevenue, doctorWorkload, appointmentsByStatus, appointmentTrend } = data || {};

  // Revenue chart data
  const revenueChartData = {
    labels: monthlyRevenue?.map(d => `${MONTHS[d.month - 1]} ${d.year}`) || [],
    datasets: [{
      label: 'Revenue (₹)',
      data: monthlyRevenue?.map(d => d.revenue) || [],
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0ea5e9',
      pointRadius: 5,
    }],
  };

  // Doctor workload chart
  const workloadChartData = {
    labels: doctorWorkload?.map(d => d.doctorName.replace('Dr. ', '')) || [],
    datasets: [{
      label: 'Appointments',
      data: doctorWorkload?.map(d => d.totalAppointments) || [],
      backgroundColor: [
        'rgba(14,165,233,0.8)', 'rgba(139,92,246,0.8)', 'rgba(16,185,129,0.8)',
        'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)',
      ],
      borderRadius: 8,
    }],
  };

  // Status doughnut
  const statusColors = {
    pending: '#f59e0b', confirmed: '#22c55e', completed: '#0ea5e9',
    cancelled: '#ef4444', rejected: '#94a3b8', no_show: '#64748b',
  };
  const statusChartData = {
    labels: appointmentsByStatus?.map(d => d.status) || [],
    datasets: [{
      data: appointmentsByStatus?.map(d => d.count) || [],
      backgroundColor: appointmentsByStatus?.map(d => statusColors[d.status] || '#cbd5e1') || [],
      borderWidth: 0,
    }],
  };

  // Appointment trend
  const trendChartData = {
    labels: appointmentTrend?.map(d => d.date) || [],
    datasets: [{
      label: 'New Appointments',
      data: appointmentTrend?.map(d => d.count) || [],
      backgroundColor: 'rgba(139,92,246,0.7)',
      borderRadius: 6,
    }],
  };

  const chartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { family: 'Plus Jakarta Sans' },
        bodyFont:  { family: 'Plus Jakarta Sans' },
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics Dashboard" subtitle="Visual insights into hospital performance" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="card lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4">Monthly Revenue Trend</h2>
          {monthlyRevenue?.length ? (
            <Line data={revenueChartData} options={chartOptions()} height={90} />
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No revenue data yet</p>
          )}
        </div>

        {/* Status Doughnut */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Appointment Status</h2>
          {appointmentsByStatus?.length ? (
            <>
              <Doughnut data={statusChartData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 11 }, padding: 12 } },
                  tooltip: { backgroundColor: '#1e293b', cornerRadius: 8 },
                },
                cutout: '65%',
              }} />
            </>
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Workload */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Doctor Workload</h2>
          {doctorWorkload?.length ? (
            <Bar data={workloadChartData} options={chartOptions()} height={110} />
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data</p>
          )}
        </div>

        {/* 7-Day Appointment Trend */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">7-Day Appointment Trend</h2>
          {appointmentTrend?.length ? (
            <Bar data={trendChartData} options={chartOptions()} height={110} />
          ) : (
            <p className="text-gray-400 text-sm py-8 text-center">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
