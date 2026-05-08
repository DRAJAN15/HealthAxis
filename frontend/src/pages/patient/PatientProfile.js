import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { PageHeader, Spinner } from '../../components/common';
import { FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS      = ['', 'male', 'female', 'other', 'prefer_not_to_say'];

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [allergyInput, setAllergyInput] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '',
    dateOfBirth: '', gender: '', bloodGroup: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    allergies: [], chronicConditions: [], currentMedications: [],
    insuranceProvider: '', insurancePolicyNumber: '',
  });

  useEffect(() => {
    patientAPI.getMe().then(r => {
      const d = r.data.data;
      setForm({
        name: d.name || '', phone: d.phone || '',
        dateOfBirth: d.profile?.dateOfBirth ? d.profile.dateOfBirth.split('T')[0] : '',
        gender:      d.profile?.gender      || '',
        bloodGroup:  d.profile?.bloodGroup  || '',
        address:     d.profile?.address     || { street: '', city: '', state: '', zipCode: '', country: '' },
        emergencyContact: d.profile?.emergencyContact || { name: '', relationship: '', phone: '' },
        allergies:          d.profile?.allergies          || [],
        chronicConditions:  d.profile?.chronicConditions  || [],
        currentMedications: d.profile?.currentMedications || [],
        insuranceProvider:     d.profile?.insuranceProvider     || '',
        insurancePolicyNumber: d.profile?.insurancePolicyNumber || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const addTag = (field, value) => {
    if (!value.trim()) return;
    setForm({ ...form, [field]: [...form[field], value.trim()] });
  };

  const removeTag = (field, idx) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await patientAPI.update(user._id, form);
      updateUser({ ...user, name: form.name, phone: form.phone });
      toast.success('Profile updated successfully!');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const inp = 'input-field';

  return (
    <div className="max-w-3xl">
      <PageHeader title="My Profile" subtitle="Keep your health information up to date" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="card space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
              {form.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">{form.name || 'Your Name'}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input className={inp} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input className={inp} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
              <input type="date" className={inp} value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select className={inp} value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                {GENDERS.map(g => <option key={g} value={g}>{g ? g.replace('_', ' ') : 'Select gender'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
              <select className={inp} value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})}>
                {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b || 'Unknown'}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Street</label>
              <input className={inp} value={form.address.street} onChange={e => setForm({...form, address: {...form.address, street: e.target.value}})} />
            </div>
            {['city','state','zipCode','country'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{field === 'zipCode' ? 'ZIP Code' : field}</label>
                <input className={inp} value={form.address[field]} onChange={e => setForm({...form, address: {...form.address, [field]: e.target.value}})} />
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            {['name','relationship','phone'].map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{field}</label>
                <input className={inp} value={form.emergencyContact[field]}
                  onChange={e => setForm({...form, emergencyContact: {...form.emergencyContact, [field]: e.target.value}})} />
              </div>
            ))}
          </div>
        </div>

        {/* Medical Info */}
        <div className="card space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">Medical Information</h3>
          {[
            { field: 'allergies',          label: 'Allergies',            placeholder: 'e.g. Penicillin' },
            { field: 'chronicConditions',  label: 'Chronic Conditions',   placeholder: 'e.g. Diabetes' },
            { field: 'currentMedications', label: 'Current Medications',  placeholder: 'e.g. Metformin 500mg' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form[field].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                    {item}
                    <button type="button" onClick={() => removeTag(field, i)}>
                      <FiX className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={`${inp} flex-1`} placeholder={placeholder}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(field, e.target.value); e.target.value = ''; } }}
                />
                <button type="button"
                  onClick={(e) => { const inp = e.currentTarget.previousSibling; addTag(field, inp.value); inp.value = ''; }}
                  className="btn-secondary px-3 py-2">
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Press Enter or click + to add</p>
            </div>
          ))}
        </div>

        {/* Insurance */}
        <div className="card space-y-4">
          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide border-b pb-2">Insurance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Insurance Provider</label>
              <input className={inp} value={form.insuranceProvider}
                onChange={e => setForm({...form, insuranceProvider: e.target.value})} placeholder="e.g. Star Health" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Policy Number</label>
              <input className={inp} value={form.insurancePolicyNumber}
                onChange={e => setForm({...form, insurancePolicyNumber: e.target.value})} placeholder="Policy #" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {saving ? <Spinner size="sm" /> : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
