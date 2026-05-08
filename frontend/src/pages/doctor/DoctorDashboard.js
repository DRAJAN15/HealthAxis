import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { StatCard, StatusBadge, PageLoader } from '../../components/common';
import { FiUsers, FiCalendar, FiDollarSign, FiClock, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';

export default function DoctorDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDoctorAnalytics()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  const { totalPatients, appointmentsByStatus, todayAppointments, totalRevenue } = data || {};
  const totalApts = appointmentsByStatus?.reduce((a, b) => a + b.count, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your appointments and patient overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="My Patients"      value={totalPatients}  icon={FiUsers}     color="sky" />
        <StatCard title="Total Appointments" value={totalApts}    icon={FiCalendar}  color="violet" />
        <StatCard title="Today's Schedule" value={todayAppointments?.length || 0} icon={FiClock} color="amber" />
        <StatCard title="Total Earnings"   value={`₹${(totalRevenue || 0).toLocaleString('en-IN')}`} icon={FiDollarSign} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Today's Appointments</h2>
            <Link to="/doctor/appointments" className="text-sky-500 text-xs hover:text-sky-700">View all →</Link>
          </div>
          {todayAppointments?.length ? (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-sky-50 transition-colors">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-100 flex flex-col items-center justify-center">
                    <span className="text-sky-700 font-bold text-sm">{apt.timeSlot?.startTime}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{apt.patient?.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{apt.reason}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <FiCalendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No appointments today</p>
            </div>
          )}
        </div>

        {/* Status Overview */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Appointment Status</h2>
          <div className="space-y-3">
            {appointmentsByStatus?.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="font-bold text-gray-700 text-lg">{count}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link to="/doctor/records/add"
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
              <FiPlus className="w-4 h-4" /> Add Medical Record
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
