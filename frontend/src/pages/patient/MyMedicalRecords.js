import React, { useEffect, useState } from 'react';
import { recordAPI } from '../../services/api';
import { PageHeader, Spinner, Modal } from '../../components/common';
import { FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { format } from 'date-fns';

function RecordCard({ record }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <FiFileText className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{record.diagnosis}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Dr. {record.doctor?.name} &nbsp;·&nbsp; {format(new Date(record.createdAt), 'dd MMM yyyy')}
            </p>
            {record.symptoms?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {record.symptoms.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 mt-1 flex-shrink-0">
          {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 fade-in">
          {/* Vitals */}
          {record.vitals && Object.values(record.vitals).some(v => v) && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vitals</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Blood Pressure', value: record.vitals.bloodPressure, unit: '' },
                  { label: 'Heart Rate',     value: record.vitals.heartRate,     unit: 'bpm' },
                  { label: 'Temperature',    value: record.vitals.temperature,   unit: '°C' },
                  { label: 'Weight',         value: record.vitals.weight,        unit: 'kg' },
                  { label: 'Height',         value: record.vitals.height,        unit: 'cm' },
                  { label: 'O₂ Sat',         value: record.vitals.oxygenSaturation, unit: '%' },
                ].filter(v => v.value).map(({ label, value, unit }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="font-bold text-gray-800 text-sm">{value}{unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prescriptions */}
          {record.prescriptions?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Prescriptions</h4>
              <div className="space-y-2">
                {record.prescriptions.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 bg-sky-50 rounded-xl px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.medicine}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.dosage} &middot; {p.frequency} &middot; {p.duration}
                      </p>
                      {p.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{p.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lab Tests */}
          {record.labTests?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Lab Tests</h4>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold">Test</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold">Result</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold">Normal Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {record.labTests.map((t, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 font-medium text-gray-700">{t.testName}</td>
                        <td className="px-4 py-2 text-gray-600">{t.result}</td>
                        <td className="px-4 py-2 text-gray-400 text-xs">{t.normalRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {record.notes && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Doctor Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 italic">{record.notes}</p>
            </div>
          )}

          {/* Follow-up */}
          {record.followUpDate && (
            <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-amber-500">📅</span>
              <p className="text-sm text-amber-700 font-medium">
                Follow-up on: {format(new Date(record.followUpDate), 'dd MMMM yyyy')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyMedicalRecords() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);

  useEffect(() => {
    recordAPI.getAll()
      .then(r => {
        setRecords(r.data.data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Medical Records" subtitle={`${total} records on file`} />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : records.length === 0 ? (
        <div className="card text-center py-16">
          <FiFileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No medical records yet</p>
          <p className="text-gray-400 text-sm mt-1">Your doctor will add records after consultations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(r => <RecordCard key={r._id} record={r} />)}
        </div>
      )}
    </div>
  );
}
