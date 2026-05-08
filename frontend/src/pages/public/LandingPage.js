import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiHeart,
  FiMapPin,
  FiSearch,
  FiShield,
  FiStar,
  FiVideo,
} from "react-icons/fi";
import { doctorAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const scoreFromId = (id = "") => {
  let score = 0;
  for (let i = 0; i < id.length; i += 1) score += id.charCodeAt(i);
  return (4.2 + (score % 8) / 10).toFixed(1);
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    hospital: "",
    specialization: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      doctorAPI
        .getAll({
          search: filters.search || undefined,
          hospital: filters.hospital || undefined,
          specialization: filters.specialization || undefined,
        })
        .then((res) => setDoctors(res.data.data || []))
        .finally(() => setLoading(false));
    }, 240);

    return () => clearTimeout(timer);
  }, [filters]);

  const hospitals = useMemo(() => {
    const set = new Set();
    doctors.forEach((doc) => {
      if (doc.profile?.hospital) set.add(doc.profile.hospital);
    });
    return Array.from(set);
  }, [doctors]);

  const specializationOptions = useMemo(() => {
    const set = new Set();
    doctors.forEach((doc) => {
      if (doc.profile?.specialization) set.add(doc.profile.specialization);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const topDoctors = useMemo(
    () =>
      [...doctors]
        .sort((a, b) => (b.profile?.experience || 0) - (a.profile?.experience || 0))
        .slice(0, 8),
    [doctors],
  );

  const featuredHospitals = useMemo(() => {
    return hospitals.slice(0, 4).map((name, idx) => ({
      name,
      distance: `${(idx + 2) * 1.2} km`,
      beds: `${180 + idx * 60} Beds`,
      score: (4.5 + idx * 0.1).toFixed(1),
      tags:
        idx % 2 === 0
          ? ["24/7 EMERGENCY", "ICU"]
          : ["MATERNITY", "PEDIATRICS"],
    }));
  }, [hospitals]);

  const hasActiveFilters = Boolean(
    filters.search || filters.hospital || filters.specialization,
  );

  const setFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: "", hospital: "", specialization: "" });
  };

  const goToBook = (doctorId) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/patient/book/${doctorId}`)}`);
      return;
    }

    if (user.role !== "patient") {
      toast.error("Only patients can book appointments.");
      return;
    }

    navigate(`/patient/book/${doctorId}`);
  };

  const dashboardPath = user
    ? ["super_admin", "hospital_admin", "admin"].includes(user.role)
      ? "/admin/dashboard"
      : `/${user.role}/dashboard`
    : null;

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900 pb-10">
      <header className="pt-5 px-4">
        <div className="max-w-6xl mx-auto rounded-full border border-black/10 bg-white px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black">
            <span className="h-5 w-5 rounded-full bg-black text-white inline-flex items-center justify-center text-[10px]">
              <FiHeart className="w-3 h-3" />
            </span>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              HealthAxis
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-[11px] font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => scrollToSection("specialists")}
              className="hover:text-slate-900"
            >
              Find Care
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("hospitals")}
              className="hover:text-slate-900"
            >
              Hospitals
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {!user ? (
              <>
                <Link to="/login" className="text-xs font-semibold px-2 py-1">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-black text-white px-3 py-1.5 text-xs font-semibold"
                >
                  Book Consult
                </Link>
              </>
            ) : (
              <Link
                to={dashboardPath}
                className="rounded-full bg-black text-white px-3 py-1.5 text-xs font-semibold"
              >
                Open Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-5">
        <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-4">
          <article className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b111a] via-[#12133a] to-[#03050a] text-white p-6 md:p-8 shadow-[0_20px_50px_-30px_rgba(2,6,23,0.8)]">
            <div className="flex items-center gap-3 mb-5">
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[10px] uppercase tracking-wide font-bold">
                Next-Gen Healthcare
              </span>
              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[10px] font-semibold">
                {doctors.length} specialists online
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-tight max-w-lg">
              Expert care,
              <span className="block text-cyan-300">on your terms.</span>
            </h1>

            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-2 flex items-center gap-2 backdrop-blur">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                  placeholder="Search doctors, hospitals..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/55 pl-9 pr-2 py-2.5 outline-none"
                />
              </div>
              <button
                type="button"
                className="rounded-lg bg-white text-black text-xs font-bold px-4 py-2.5"
              >
                Find Care
              </button>
            </div>
          </article>

          <aside className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 relative overflow-hidden">
              <span className="absolute right-4 top-4 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                VERIFIED
              </span>
              <div className="w-8 h-8 rounded-full border border-emerald-300 text-emerald-700 flex items-center justify-center">
                <FiShield className="w-4 h-4" />
              </div>
              <p className="mt-4 text-3xl font-black">100%</p>
              <p className="text-xs text-emerald-900/70 mt-1">Secure and private consultations</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="w-8 h-8 rounded-full border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <FiBriefcase className="w-4 h-4" />
              </div>
              <p className="mt-4 text-3xl font-black">24/7</p>
              <p className="text-xs text-slate-500 mt-1">Premium network hospitals across cities</p>
            </div>
          </aside>
        </section>

        <section className="mt-5 rounded-2xl bg-white border border-slate-200 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg bg-black text-white px-3 py-1.5 text-[11px] font-bold"
            >
              All Specialists
            </button>
            {specializationOptions.slice(0, 7).map((specialization) => (
              <button
                key={specialization}
                type="button"
                onClick={() => setFilter("specialization", specialization)}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold ${filters.specialization === specialization
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white border-slate-200 text-slate-600"
                  }`}
              >
                {specialization}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            <select
              value={filters.hospital}
              onChange={(e) => setFilter("hospital", e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Hospitals</option>
              {hospitals.map((hospital) => (
                <option key={hospital} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
            >
              Reset Filters
            </button>
          </div>
        </section>

        <section id="specialists" className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black">Top Specialists</h2>
            <p className="text-xs text-blue-600 font-semibold inline-flex items-center gap-1">
              View all directory <FiArrowRight className="w-3 h-3" />
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              Loading doctors...
            </div>
          ) : topDoctors.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topDoctors.map((doc) => (
                <article key={doc._id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-white text-sm font-bold flex items-center justify-center">
                      {doc.name?.charAt(0) || "D"}
                    </div>
                    <span className="rounded-md bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                      <FiStar className="w-2.5 h-2.5" /> {scoreFromId(doc._id)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold leading-tight">Dr. {doc.name}</p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                    {doc.profile?.specialization || "General Medicine"}
                  </p>

                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] text-slate-500 space-y-1">
                    <p className="inline-flex items-center gap-1">
                      <FiClock className="w-3 h-3" /> {doc.profile?.experience || 0} yrs Experience
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <FiArrowRight className="w-3 h-3" /> Rs. {doc.profile?.consultationFee || 0} / consultation
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-md border border-slate-200 bg-white text-[11px] font-semibold py-1.5 inline-flex items-center justify-center gap-1"
                    >
                      <FiVideo className="w-3 h-3" /> Video
                    </button>
                    <button
                      type="button"
                      onClick={() => goToBook(doc._id)}
                      className="flex-1 rounded-md bg-black text-white text-[11px] font-semibold py-1.5"
                    >
                      Book
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              No doctors matched your filters.
            </div>
          )}
        </section>

        <section id="hospitals" className="mt-8">
          <h2 className="text-lg font-black mb-3">Facilities Near You</h2>

          {featuredHospitals.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featuredHospitals.map((hospital) => (
                <Link
                  key={hospital.name}
                  to={`/hospitals/${encodeURIComponent(hospital.name)}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{hospital.name}</p>
                      <p className="text-[11px] text-slate-500 mt-1 inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1"><FiMapPin className="w-3 h-3" /> {hospital.distance}</span>
                        <span>{hospital.beds}</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {hospital.tags.map((tag) => (
                          <span key={tag} className="text-[9px] tracking-wide rounded bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                        <FiStar className="w-2.5 h-2.5" /> {hospital.score}
                      </span>
                      <p className="mt-7 text-slate-400 inline-flex items-center gap-1 text-xs">
                        View <FiArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              No hospitals available yet.
            </div>
          )}
        </section>
      </main>

      <footer id="footer" className="max-w-6xl mx-auto px-4 mt-10">
        <div className="rounded-t-[1.75rem] rounded-b-3xl bg-[#05080f] text-slate-300 px-6 py-8 md:px-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-white font-black text-sm">HealthAxis</p>
            <p className="text-xs mt-2 text-slate-400 max-w-[14rem]">
              Redefining healthcare accessibility with modern technology and trusted doctors.
            </p>
          </div>
          <div>
            <p className="text-white text-xs font-bold mb-2">Patients</p>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>Find a Doctor</li>
              <li>Book Video Consult</li>
              <li>Health Records</li>
            </ul>
          </div>
          <div>
            <p className="text-white text-xs font-bold mb-2">Providers</p>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>Join Network</li>
              <li>HealthAxis Pro</li>
              <li>Clinical Tools</li>
            </ul>
          </div>
          <div>
            <p className="text-white text-xs font-bold mb-2">Company</p>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>About Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
