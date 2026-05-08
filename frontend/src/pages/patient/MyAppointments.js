import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import { PageHeader, StatusBadge, Spinner } from '../../components/common';
import { FiCalendar, FiX, FiCreditCard } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const FILTERS = ['', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setFilter] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await appointmentAPI.getAll({ status: statusFilter });
      setAppointments(r.data.data);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setCancelling(id);
    try {
      await appointmentAPI.cancel(id, { reason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      fetch();
    } finally { setCancelling(null); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="My Appointments" subtitle={`${appointments.length} appointments`} />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s ? 'bg-sky-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-16">
          <FiCalendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No appointments found</p>
          <button onClick={() => navigate('/patient/doctors')} className="btn-primary mt-4 text-sm">
            Book an Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* Left: date badge + info */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-sky-700 font-bold text-sm leading-none">
                      {format(new Date(apt.appointmentDate), 'dd')}
                    </span>
                    <span className="text-sky-400 text-xs mt-0.5">
                      {format(new Date(apt.appointmentDate), 'MMM')}
                    </span>
                    <span className="text-sky-400 text-xs">
                      {format(new Date(apt.appointmentDate), 'yyyy')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-800">Dr. {apt.doctor?.name}</h3>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {apt.timeSlot?.startTime} – {apt.timeSlot?.endTime}
                      &nbsp;·&nbsp;
                      <span className="capitalize">{apt.type}</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1 max-w-sm">{apt.reason}</p>
                    {apt.doctorNotes && (
                      <p className="text-xs text-sky-600 mt-1 italic bg-sky-50 px-2 py-1 rounded-lg inline-block">
                        Doctor: {apt.doctorNotes}
                      </p>
                    )}
                    {apt.cancellationReason && (
                      <p className="text-xs text-red-500 mt-1 italic">
                        Reason: {apt.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: fee + actions */}
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-gray-800 text-lg">₹{apt.consultationFee}</p>
                  {apt.isPaid ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      ✓ Paid
                    </span>
                  ) : (
                    apt.status === 'confirmed' && (
                      <button
                        onClick={() => navigate(`/patient/payment/${apt._id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors"
                      >
                        <FiCreditCard className="w-3.5 h-3.5" /> Pay Now
                      </button>
                    )
                  )}
                  {['pending', 'confirmed'].includes(apt.status) && (
                    <button
                      onClick={() => handleCancel(apt._id)}
                      disabled={cancelling === apt._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {cancelling === apt._id ? <Spinner size="sm" /> : <FiX className="w-3.5 h-3.5" />}
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
