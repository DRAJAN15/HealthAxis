import React, { useEffect, useState, useCallback } from 'react';
import { appointmentAPI } from '../../services/api';
import { PageHeader, StatusBadge, Modal, Spinner } from '../../components/common';
import { FiCheck, FiX, FiFileText, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionModal, setActionModal] = useState({ open: false, apt: null, action: '' });
  const [notes, setNotes]  = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await appointmentAPI.getAll({ status: statusFilter });
      setAppointments(r.data.data);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = async () => {
    setSaving(true);
    try {
      await appointmentAPI.updateStatus(actionModal.apt._id, {
        status: actionModal.action,
        doctorNotes: notes,
        cancellationReason: actionModal.action === 'rejected' ? notes : undefined,
      });
      toast.success(`Appointment ${actionModal.action}`);
      setActionModal({ open: false, apt: null, action: '' });
      setNotes('');
      fetch();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="My Appointments" subtitle={`${appointments.length} appointments`} />

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s ? 'bg-sky-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-16">
          <FiCalendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt._id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-sky-700 font-bold text-xs">
                      {format(new Date(apt.appointmentDate), 'dd')}
                    </span>
                    <span className="text-sky-500 text-xs">
                      {format(new Date(apt.appointmentDate), 'MMM')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{apt.patient?.name}</p>
                      <StatusBadge status={apt.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {apt.timeSlot?.startTime} – {apt.timeSlot?.endTime} &nbsp;·&nbsp; {apt.type}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 max-w-md">{apt.reason}</p>
                    {apt.doctorNotes && (
                      <p className="text-xs text-sky-600 mt-1 italic">Notes: {apt.doctorNotes}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-gray-800">₹{apt.consultationFee}</p>
                  {apt.isPaid && <span className="text-xs text-green-600 font-medium">✓ Paid</span>}
                  {apt.status === 'pending' && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setActionModal({ open: true, apt, action: 'confirmed' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors">
                        <FiCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setActionModal({ open: true, apt, action: 'rejected' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                        <FiX className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => setActionModal({ open: true, apt, action: 'completed' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
                      <FiFileText className="w-3.5 h-3.5" /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, apt: null, action: '' })}
        title={`${actionModal.action === 'confirmed' ? 'Confirm' : actionModal.action === 'rejected' ? 'Reject' : 'Complete'} Appointment`}
      >
        <div className="space-y-4">
          {actionModal.apt && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-semibold text-gray-800">{actionModal.apt.patient?.name}</p>
              <p className="text-sm text-gray-500">{format(new Date(actionModal.apt.appointmentDate), 'dd MMM yyyy')} at {actionModal.apt.timeSlot?.startTime}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {actionModal.action === 'rejected' ? 'Rejection Reason' : 'Notes (optional)'}
            </label>
            <textarea
              className="input-field resize-none" rows={3}
              placeholder={actionModal.action === 'rejected' ? 'Reason for rejection...' : 'Add any notes...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => setActionModal({ open: false })}>Cancel</button>
            <button
              disabled={saving}
              onClick={handleAction}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl text-white transition-colors ${
                actionModal.action === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              }`}>
              {saving ? <Spinner size="sm" /> : `Confirm ${actionModal.action}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
