import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../../services/api';
import { PageHeader, Spinner } from '../../components/common';
import { FiCalendar, FiClock, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

const APPOINTMENT_TYPES = ['in-person', 'video', 'phone'];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor]   = useState(null);
  const [slots, setSlots]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    slot: null,
    reason: '',
    type: 'in-person',
  });

  // Load doctor info
  useEffect(() => {
    doctorAPI.getOne(doctorId)
      .then(r => setDoctor(r.data.data))
      .finally(() => setLoading(false));
  }, [doctorId]);

  // Load slots when date changes
  useEffect(() => {
    if (!form.date) return;
    setSlotsLoading(true);
    setForm(f => ({ ...f, slot: null }));
    doctorAPI.getAvailableSlots(doctorId, form.date)
      .then(r => setSlots(r.data.data))
      .finally(() => setSlotsLoading(false));
  }, [form.date, doctorId]);

  const handleBook = async () => {
    if (!form.slot) { toast.error('Please select a time slot'); return; }
    if (!form.reason.trim()) { toast.error('Please provide a reason'); return; }

    setBooking(true);
    try {
      const r = await appointmentAPI.book({
        doctorId,
        appointmentDate: form.date,
        timeSlot: form.slot,
        reason: form.reason,
        type: form.type,
      });
      toast.success('Appointment booked! Redirecting to payment...');
      navigate(`/patient/payment/${r.data.data._id}`);
    } finally { setBooking(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!doctor) return <div className="text-center py-16 text-gray-400">Doctor not found</div>;

  const profile = doctor.profile;
  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  return (
    <div className="max-w-2xl">
      <PageHeader title="Book Appointment" subtitle="Select your preferred date and time" />

      {/* Doctor Card */}
      <div className="card mb-6 bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {doctor.name?.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{doctor.name}</h2>
            <p className="text-sky-600 font-medium text-sm">{profile?.specialization}</p>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <FiClock className="w-3 h-3" /> {profile?.experience} yrs exp.
              </span>
              <span className="text-xs text-gray-700 font-semibold flex items-center gap-1">
                <FiDollarSign className="w-3 h-3 text-emerald-500" /> ₹{profile?.consultationFee}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Date Picker */}
        <div className="card">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-sky-500" /> Select Date
          </label>
          <input
            type="date" className="input-field"
            min={minDate} max={maxDate}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* Time Slots */}
        <div className="card">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FiClock className="w-4 h-4 text-sky-500" /> Select Time Slot
          </label>
          {slotsLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : slots.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => setForm({ ...form, slot })}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                    form.slot?.startTime === slot.startTime
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-sky-300 hover:bg-sky-50'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-4 text-amber-600 bg-amber-50 rounded-xl px-4">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">No available slots on this date. Please choose another day.</p>
            </div>
          )}
        </div>

        {/* Appointment Type */}
        <div className="card">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Appointment Type</label>
          <div className="flex gap-2 flex-wrap">
            {APPOINTMENT_TYPES.map(t => (
              <button key={t} type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                  form.type === t ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-200'
                }`}>
                {t === 'in-person' ? '🏥 In-Person' : t === 'video' ? '📹 Video Call' : '📞 Phone Call'}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="card">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Reason for Visit *</label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Describe your symptoms or reason for appointment..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </div>

        {/* Summary */}
        {form.slot && (
          <div className="card bg-emerald-50 border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor</span>
                <span className="font-semibold">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{format(new Date(form.date), 'dd MMMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold">{form.slot.startTime} – {form.slot.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-semibold capitalize">{form.type}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-200">
                <span className="font-bold text-gray-800">Consultation Fee</span>
                <span className="font-bold text-emerald-700 text-base">₹{profile?.consultationFee}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Back</button>
          <button
            type="button" onClick={handleBook} disabled={booking || !form.slot}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {booking ? <Spinner size="sm" /> : `Book & Pay ₹${profile?.consultationFee}`}
          </button>
        </div>
      </div>
    </div>
  );
}
