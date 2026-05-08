import React, { useEffect, useState, useCallback } from 'react';
import { appointmentAPI } from '../../services/api';
import { PageHeader, Table, StatusBadge } from '../../components/common';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState({ status: '', page: 1 });
  const [pagination, setPagination] = useState({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await appointmentAPI.getAll({ ...filter });
      setAppointments(r.data.data);
      setPagination({ total: r.data.total, pages: r.data.pages, current: r.data.currentPage });
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const columns = [
    { key: 'patient', label: 'Patient', render: (r) => r.patient?.name || '—' },
    { key: 'doctor',  label: 'Doctor',  render: (r) => `Dr. ${r.doctor?.name || '—'}` },
    { key: 'date',    label: 'Date',    render: (r) => format(new Date(r.appointmentDate), 'dd MMM yyyy') },
    { key: 'time',    label: 'Time',    render: (r) => r.timeSlot?.startTime || '—' },
    { key: 'reason',  label: 'Reason',  render: (r) => <span className="truncate max-w-[150px] block">{r.reason}</span> },
    { key: 'fee',     label: 'Fee',     render: (r) => `₹${r.consultationFee}` },
    { key: 'paid',    label: 'Paid',    render: (r) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {r.isPaid ? 'Paid' : 'Unpaid'}
      </span>
    )},
    { key: 'status',  label: 'Status',  render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="All Appointments" subtitle={`Total: ${pagination.total || 0}`} />

      <div className="flex gap-3">
        <select className="input-field max-w-[200px]" value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table columns={columns} data={appointments} loading={loading} emptyTitle="No appointments found" />
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setFilter({ ...filter, page: p })}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === pagination.current ? 'bg-sky-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
