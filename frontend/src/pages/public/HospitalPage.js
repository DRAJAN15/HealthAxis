import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiStar,
  FiVideo,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { hospitalAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const scoreFromId = (id = "") => {
  let score = 0;
  for (let i = 0; i < id.length; i += 1) score += id.charCodeAt(i);
  return (4.2 + (score % 8) / 10).toFixed(1);
};

export default function HospitalPage() {
  const { hospitalName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const decodedHospitalName = useMemo(
    () => decodeURIComponent(hospitalName || ""),
    [hospitalName],
  );

  useEffect(() => {
    setLoading(true);
    hospitalAPI
      .getOne(decodedHospitalName)
      .then((res) => {
        setHospital(res.data.data?.hospital || null);
        setDoctors(res.data.data?.doctors || []);
      })
      .finally(() => setLoading(false));
  }, [decodedHospitalName]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "doctors", label: "Doctors" },
    { key: "facilities", label: "Facilities" },
    { key: "contact", label: "Contact" },
  ];

  const topSpecializations = useMemo(() => {
    return Array.from(
      new Set(doctors.map((d) => d.profile?.specialization).filter(Boolean)),
    ).slice(0, 5);
  }, [doctors]);

  const goToBook = (doctorId) => {
    if (!user) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/patient/book/${doctorId}`)}`,
      );
      return;
    }

    if (user.role !== "patient") {
      toast.error("Only patients can book appointments.");
      return;
    }

    navigate(`/patient/book/${doctorId}`);
  };

  const onFindCare = () => {
    setActiveTab("doctors");
    const node = document.getElementById("hospital-content");
    if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900 pb-10">
      <header className="pt-5 px-4 sticky top-0 z-20 backdrop-blur-xl bg-[#f4f6f8]/80">
        <div className="max-w-6xl mx-auto rounded-full border border-black/10 bg-white px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black">
            <span className="h-5 w-5 rounded-full bg-black text-white inline-flex items-center justify-center text-[10px]">
              <FiHeart className="w-3 h-3" />
            </span>
            HealthAxis
          </div>

          <nav className="hidden md:flex items-center gap-5 text-[11px] font-semibold text-slate-500">
            <button
              type="button"
              onClick={onFindCare}
              className="hover:text-slate-900"
            >
              Find Care
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="hover:text-slate-900"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className="hover:text-slate-900"
            >
              Contact
            </button>
          </nav>

          <Link
            to="/"
            className="rounded-full bg-black text-white px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-5">
        <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.9fr] gap-4">
          <article className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b111a] via-[#12133a] to-[#03050a] text-white p-6 md:p-8 shadow-[0_20px_50px_-30px_rgba(2,6,23,0.8)]">
            <div className="flex items-center gap-3 mb-5">
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[10px] uppercase tracking-wide font-bold inline-flex items-center gap-1.5">
                <FiMapPin className="w-3 h-3" /> Hospital Profile
              </span>
              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[10px] font-semibold">
                {doctors.length} specialists available
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-[0.98] tracking-tight max-w-2xl">
              {decodedHospitalName}
            </h1>

            <p className="mt-3 text-sm text-white/80 max-w-2xl leading-relaxed">
              {hospital?.about ||
                "Discover trusted specialists, compare profiles, and book care instantly."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <FiShield className="w-3.5 h-3.5" /> Verified Care Network
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <FiCalendar className="w-3.5 h-3.5" /> Real-time Availability
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab.key
                      ? "bg-white text-slate-900"
                      : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </article>

          <aside className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                VERIFIED
              </span>
              <div className="w-8 h-8 rounded-full border border-emerald-300 text-emerald-700 flex items-center justify-center mt-3">
                <FiShield className="w-4 h-4" />
              </div>
              <p className="mt-4 text-3xl font-black">{doctors.length}</p>
              <p className="text-xs text-emerald-900/70 mt-1">Doctors currently active in this hospital</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="w-8 h-8 rounded-full border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <FiBriefcase className="w-4 h-4" />
              </div>
              <p className="mt-4 text-3xl font-black">{(hospital?.facilities || []).length}</p>
              <p className="text-xs text-slate-500 mt-1">Facilities and care services available</p>
            </div>
          </aside>
        </section>

        <section id="hospital-content" className="mt-6">
          {loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              Loading hospital data...
            </div>
          )}

          {!loading && activeTab === "overview" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-black">Hospital Overview</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {hospital?.about || "No overview available for this hospital."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-3">
                  <p className="text-xs text-cyan-700">Doctors</p>
                  <p className="text-2xl font-black text-cyan-900">{doctors.length}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 col-span-2 sm:col-span-3">
                  <p className="text-xs text-emerald-700">Top Specializations</p>
                  <p className="text-sm font-semibold text-emerald-900 mt-1">
                    {topSpecializations.join(", ") || "No specialization data"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "doctors" && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black">Top Specialists</h2>
                <p className="text-xs text-blue-600 font-semibold inline-flex items-center gap-1">
                  Book instantly <FiArrowRight className="w-3 h-3" />
                </p>
              </div>

              {doctors.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {doctors.map((doc) => (
                    <article
                      key={doc._id}
                      className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
                    >
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

                      <div className="mt-3 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] text-slate-500">
                        <p className="font-semibold text-slate-700 mb-1">Today</p>
                        {(() => {
                          const today = WEEK_DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                          const slot = (doc.profile?.availability || []).find((a) => a.day === today);
                          return (
                            <p className={slot ? "text-cyan-700" : "text-slate-400"}>
                              {slot ? `${slot.startTime} - ${slot.endTime}` : "Not available"}
                            </p>
                          );
                        })()}
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
                  No doctors found for this hospital.
                </div>
              )}
            </>
          )}

          {!loading && activeTab === "facilities" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black mb-4">Facilities Near You</h2>
              {(hospital?.facilities || []).length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hospital.facilities.map((facility) => (
                    <div
                      key={facility}
                      className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 flex items-center gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-900">{facility}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No facilities listed yet.</p>
              )}
            </div>
          )}

          {!loading && activeTab === "contact" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-black">Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 inline-flex items-center gap-2">
                    <FiPhone className="w-4 h-4 text-cyan-600" />
                    {hospital?.contact?.phone || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 inline-flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-cyan-600" />
                    {hospital?.contact?.email || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 inline-flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-cyan-600" />
                    {[hospital?.contact?.address, hospital?.contact?.city, hospital?.contact?.state]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && (
            <div className="mt-8 rounded-[1.75rem] border border-white/70 bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 p-6 md:p-8 shadow-[0_20px_65px_-28px_rgba(3,7,18,0.7)] flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-white">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Need an appointment today?</h3>
                <p className="text-sm text-cyan-100 mt-1">Switch to doctors and reserve your consultation in minutes.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("doctors")}
                className="rounded-full bg-white text-black px-4 py-2 text-xs font-bold inline-flex items-center gap-1"
              >
                Explore Doctors <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-10">
        <div className="rounded-t-[1.75rem] rounded-b-3xl bg-[#05080f] text-slate-300 px-6 py-8 md:px-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-white font-black text-sm">HealthAxis</p>
            <p className="text-xs mt-2 text-slate-400 max-w-[14rem]">
              Premium care network with verified specialists and modern hospital workflows.
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
