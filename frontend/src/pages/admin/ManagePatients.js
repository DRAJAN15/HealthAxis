// ManagePatients.js
import React, { useEffect, useState, useCallback } from 'react';
import { patientAPI } from '../../services/api';
import { PageHeader, Table, StatusBadge } from '../../components/common';
import { FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const r = await patientAPI.getAll({ search });
      setPatients(r.data.data);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const columns = [
    { key: 'name', label: 'Patient', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
          {r.name?.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      </div>
    )},
    { key: 'phone',    label: 'Phone',      render: (r) => r.phone || '—' },
    { key: 'gender',   label: 'Gender',     render: (r) => r.profile?.gender || '—' },
    { key: 'blood',    label: 'Blood Group',render: (r) => r.profile?.bloodGroup || '—' },
    { key: 'joined',   label: 'Joined',     render: (r) => format(new Date(r.createdAt), 'dd MMM yyyy') },
    { key: 'status',   label: 'Status',     render: (r) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
        {r.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Manage Patients" subtitle={`${patients.length} registered patients`} />
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input className="input-field pl-10" placeholder="Search patients..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="card p-0 overflow-hidden">
        <Table columns={columns} data={patients} loading={loading} emptyTitle="No patients found" />
      </div>
    </div>
  );
}
