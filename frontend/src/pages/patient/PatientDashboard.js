// PatientDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';
import { StatCard, StatusBadge, PageLoader } from '../../components/common';
import { FiCalendar, FiFileText, FiDollarSign, FiSearch, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getPatientAnalytics()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  const { appointmentsByStatus, upcomingAppointments, totalSpent, recentRecords } = data || {};
  const total = appointmentsByStatus?.reduce((a, b) => a + b.count, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your health overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Appointments" value={total}                      icon={FiCalendar}  color="sky" />
        <StatCard title="Medical Records"    value={recentRecords?.length || 0} icon={FiFileText}  color="violet" />
        <StatCard title="Total Spent"        value={`₹${(totalSpent||0).toLocaleString('en-IN')}`} icon={FiDollarSign} color="emerald" />
      </div>

      {/* Quick Book */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="font-bold text-xl mb-1">Book an Appointment</h2>
        <p className="text-sky-100 text-sm mb-4">Find a specialist and schedule your visit</p>
        <Link to="/patient/doctors" className="inline-flex items-center gap-2 bg-white text-sky-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-sky-50 transition-colors">
          <FiSearch className="w-4 h-4" /> Find Doctors
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Upcoming Appointments</h2>
            <Link to="/patient/appointments" className="text-sky-500 text-xs flex items-center gap-1 hover:text-sky-700">
              View all <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingAppointments?.length ? (
            <div className="space-y-3">
              {upcomingAppointments.map(apt => (
                <div key={apt._id} className="flex items-center gap-3 p-3 rounded-xl bg-sky-50">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{format(new Date(apt.appointmentDate), 'dd')}</span>
                    <span className="text-sky-200 text-xs">{format(new Date(apt.appointmentDate), 'MMM')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">Dr. {apt.doctor?.name}</p>
                    <p className="text-xs text-gray-500">{apt.timeSlot?.startTime}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-6 text-center">No upcoming appointments</p>
          )}
        </div>

        {/* Recent Records */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Recent Medical Records</h2>
            <Link to="/patient/records" className="text-sky-500 text-xs flex items-center gap-1 hover:text-sky-700">
              View all <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentRecords?.length ? (
            <div className="space-y-3">
              {recentRecords.map(r => (
                <div key={r._id} className="p-3 rounded-xl bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">{r.diagnosis}</p>
                  <p className="text-xs text-gray-500">Dr. {r.doctor?.name} · {format(new Date(r.createdAt), 'dd MMM yyyy')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-6 text-center">No medical records yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
