import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';
import { PageHeader, Spinner } from '../../components/common';
import toast from 'react-hot-toast';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({});

  useEffect(() => {
    doctorAPI.getOne(user._id).then(r => {
      const d = r.data.data;
      setProfile(d);
      setForm({
        name: d.name || '', phone: d.phone || '',
        specialization: d.profile?.specialization || '',
        qualification:  d.profile?.qualification  || '',
        experience:     d.profile?.experience     || '',
        consultationFee:d.profile?.consultationFee|| '',
        bio:            d.profile?.bio            || '',
        hospital:       d.profile?.hospital       || '',
        isAcceptingAppointments: d.profile?.isAcceptingAppointments ?? true,
        availability: d.profile?.availability || [],
      });
    }).finally(() => setLoading(false));
  }, [user._id]);

  const toggleDay = (day) => {
    const exists = form.availability.find(a => a.day === day);
    if (exists) {
      setForm({ ...form, availability: form.availability.filter(a => a.day !== day) });
    } else {
      setForm({ ...form, availability: [...form.availability, { day, startTime: '09:00', endTime: '17:00', slotDuration: 30 }] });
    }
  };

  const updateSlot = (day, field, value) => {
    setForm({
      ...form,
      availability: form.availability.map(a => a.day === day ? { ...a, [field]: value } : a),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await doctorAPI.update(user._id, form);
      toast.success('Profile updated successfully!');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl">
      <PageHeader title="My Profile" subtitle="Update your profile and availability" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
              <input className="input-field" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Qualification</label>
              <input className="input-field" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (years)</label>
              <input type="number" className="input-field" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fee (₹)</label>
              <input type="number" className="input-field" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea rows={3} className="input-field resize-none" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isAcceptingAppointments}
              onChange={e => setForm({...form, isAcceptingAppointments: e.target.checked})}
              className="w-4 h-4 accent-sky-500" />
            <span className="text-sm font-medium text-gray-700">Accepting new appointments</span>
          </label>
        </div>

        {/* Availability */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800">Weekly Availability</h2>
          <div className="space-y-3">
            {DAYS.map(day => {
              const slot = form.availability.find(a => a.day === day);
              return (
                <div key={day} className={`rounded-xl border transition-all ${slot ? 'border-sky-200 bg-sky-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 p-3">
                    <input type="checkbox" checked={!!slot} onChange={() => toggleDay(day)}
                      className="w-4 h-4 accent-sky-500" />
                    <span className="font-medium text-sm text-gray-700 w-24">{day}</span>
                    {slot && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <input type="time" className="input-field py-1.5 w-32 text-sm" value={slot.startTime}
                          onChange={e => updateSlot(day, 'startTime', e.target.value)} />
                        <span className="text-gray-400 text-sm">to</span>
                        <input type="time" className="input-field py-1.5 w-32 text-sm" value={slot.endTime}
                          onChange={e => updateSlot(day, 'endTime', e.target.value)} />
                        <select className="input-field py-1.5 w-28 text-sm" value={slot.slotDuration}
                          onChange={e => updateSlot(day, 'slotDuration', Number(e.target.value))}>
                          <option value={15}>15 min</option>
                          <option value={20}>20 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>60 min</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {saving ? <Spinner size="sm" /> : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
