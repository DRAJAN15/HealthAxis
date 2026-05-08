import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../../services/api';
import { PageHeader, Spinner } from '../../components/common';
import { FiSearch, FiStar, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';

const SPECIALIZATIONS = ['','Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics','General Medicine','ENT','Ophthalmology','Psychiatry'];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [spec, setSpec]       = useState('');

  useEffect(() => {
    setLoading(true);
    doctorAPI.getAll({ search, specialization: spec })
      .then(r => setDoctors(r.data.data))
      .finally(() => setLoading(false));
  }, [search, spec]);

  return (
    <div className="space-y-5">
      <PageHeader title="Find Doctors" subtitle="Browse and book appointments with our specialists" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search by name..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field max-w-[220px]" value={spec} onChange={(e) => setSpec(e.target.value)}>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s || 'All Specializations'}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map(doc => (
            <div key={doc._id} className="card hover:shadow-md transition-shadow group">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-sm">
                  {doc.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm">{doc.name}</h3>
                  <p className="text-sky-600 text-xs font-medium mt-0.5">{doc.profile?.specialization}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{doc.profile?.qualification}</p>
                </div>
                {doc.profile?.isAcceptingAppointments ? (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Available</span>
                ) : (
                  <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">Unavailable</span>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiClock className="w-3.5 h-3.5" />
                  <span>{doc.profile?.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiDollarSign className="w-3.5 h-3.5" />
                  <span>₹{doc.profile?.consultationFee} per consultation</span>
                </div>
                {doc.profile?.hospital && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>🏥 {doc.profile.hospital}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {doc.profile?.bio && (
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{doc.profile.bio}</p>
              )}

              {/* Book Button */}
              {doc.profile?.isAcceptingAppointments ? (
                <Link
                  to={`/patient/book/${doc._id}`}
                  className="btn-primary w-full text-center text-sm flex items-center justify-center gap-2"
                >
                  <FiCalendar className="w-4 h-4" /> Book Appointment
                </Link>
              ) : (
                <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed">
                  Not Available
                </button>
              )}
            </div>
          ))}
          {!doctors.length && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <FiSearch className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No doctors found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
