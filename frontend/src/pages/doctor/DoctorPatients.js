// DoctorPatients.js
import React, { useEffect, useState } from 'react';
import { patientAPI } from '../../services/api';
import { PageHeader, Table } from '../../components/common';

export function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    patientAPI.getAll().then(r => setPatients(r.data.data)).finally(() => setLoading(false));
  }, []);

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
    { key: 'phone',      label: 'Phone',       render: (r) => r.phone || '—' },
    { key: 'gender',     label: 'Gender',      render: (r) => r.profile?.gender || '—' },
    { key: 'blood',      label: 'Blood Group', render: (r) => r.profile?.bloodGroup || '—' },
    { key: 'allergies',  label: 'Allergies',   render: (r) => r.profile?.allergies?.join(', ') || 'None' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Patients" subtitle={`${patients.length} patients`} />
      <div className="card p-0 overflow-hidden">
        <Table columns={columns} data={patients} loading={loading} emptyTitle="No patients found" />
      </div>
    </div>
  );
}

export default DoctorPatients;
