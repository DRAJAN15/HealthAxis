import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { analyticsAPI, userAPI } from "../../services/api";
import { StatCard, StatusBadge, PageLoader } from "../../components/common";
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiUserCheck,
  FiArrowRight,
  FiBriefcase,
  FiShield,
  FiPieChart,
} from "react-icons/fi";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalAdmins, setHospitalAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const requests = [analyticsAPI.getDashboard()];
        if (isSuperAdmin) {
          requests.push(userAPI.getHospitals(), userAPI.getHospitalAdmins());
        }

        const [dashboardRes, hospitalsRes, adminsRes] =
          await Promise.all(requests);
        setData(dashboardRes?.data?.data || null);

        if (isSuperAdmin) {
          setHospitals(hospitalsRes?.data?.data || []);
          setHospitalAdmins(adminsRes?.data?.data || []);
        } else {
          setHospitals([]);
          setHospitalAdmins([]);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isSuperAdmin]);

  const { overview, appointmentsByStatus, recentAppointments, doctorWorkload } =
    data || {};
  const coveredHospitals = useMemo(() => {
    const set = new Set();
    hospitalAdmins.forEach((admin) => {
      if (admin.hospital) set.add(admin.hospital);
    });
    return set.size;
  }, [hospitalAdmins]);

  const hospitalCoverage = hospitals.length
    ? `${coveredHospitals}/${hospitals.length}`
    : "0/0";

  const quickLinks = [
    ...(isSuperAdmin
      ? [
          {
            label: "Hospitals",
            to: "/admin/hospitals",
            color: "from-cyan-500 to-blue-600",
          },
          {
            label: "Hospital Admins",
            to: "/admin/hospital-admins",
            color: "from-rose-500 to-orange-500",
          },
        ]
      : []),
    {
      label: "Add Doctor",
      to: "/admin/doctors",
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "All Patients",
      to: "/admin/patients",
      color: "from-sky-500 to-blue-600",
    },
    {
      label: "Appointments",
      to: "/admin/appointments",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Analytics",
      to: "/admin/analytics",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const appointmentStatusData = useMemo(() => {
    const labels = (appointmentsByStatus || []).map((x) =>
      x.status.replace("_", " "),
    );
    const values = (appointmentsByStatus || []).map((x) => x.count);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#38bdf8",
            "#34d399",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#f97316",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [appointmentsByStatus]);

  const hospitalDoctorData = useMemo(() => {
    const top = [...hospitals]
      .sort((a, b) => b.doctorCount - a.doctorCount)
      .slice(0, 6);
    return {
      labels: top.map((h) => h.name),
      datasets: [
        {
          label: "Doctors",
          data: top.map((h) => h.doctorCount),
          backgroundColor: "#0ea5e9",
          borderRadius: 8,
        },
      ],
    };
  }, [hospitals]);

  const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
  };

  const hospitalBarOptions = {
    ...chartBaseOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return label.length > 14 ? `${label.slice(0, 14)}...` : label;
          },
        },
      },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
    plugins: {
      ...chartBaseOptions.plugins,
      legend: { display: false },
    },
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {isSuperAdmin ? (
        <div className="rounded-3xl p-6 md:p-7 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wider text-white/80 font-semibold">
            Super Admin
          </p>
          <h1 className="text-2xl md:text-3xl font-black mt-1">
            System Command Center
          </h1>
          <p className="text-sm text-white/90 mt-2 max-w-2xl">
            Manage all hospitals, hospital admins, doctors, and patients from a
            single control layer.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Link
              to="/admin/hospitals"
              className="bg-white text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50"
            >
              Manage Hospitals
            </Link>
            <Link
              to="/admin/hospital-admins"
              className="bg-orange-900/25 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-900/35"
            >
              Manage Hospital Admins
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Hospital overview and key metrics
          </p>
        </div>
      )}

      {/* Stats */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${isSuperAdmin ? "xl:grid-cols-6" : "xl:grid-cols-4"} gap-4`}
      >
        {isSuperAdmin && (
          <StatCard
            title="Hospitals"
            value={hospitals.length}
            icon={FiBriefcase}
            color="rose"
          />
        )}
        {isSuperAdmin && (
          <StatCard
            title="Hospital Admins"
            value={hospitalAdmins.length}
            icon={FiShield}
            color="violet"
          />
        )}
        <StatCard
          title="Total Patients"
          value={overview?.totalPatients}
          icon={FiUsers}
          color="sky"
        />
        <StatCard
          title="Total Doctors"
          value={overview?.totalDoctors}
          icon={FiUserCheck}
          color="violet"
        />
        <StatCard
          title="Total Appointments"
          value={overview?.totalAppointments}
          icon={FiCalendar}
          color="amber"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(overview?.totalRevenue || 0).toLocaleString("en-IN")}`}
          icon={FiDollarSign}
          color="emerald"
        />
      </div>

      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Hospitals Snapshot</h2>
              <Link
                to="/admin/hospitals"
                className="text-sky-600 text-xs flex items-center gap-1 hover:text-sky-700"
              >
                Manage <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {hospitals.slice(0, 6).map((hospital) => (
                <div
                  key={hospital.name}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-gray-800 truncate pr-2">
                    {hospital.name}
                  </p>
                  <span className="text-xs font-semibold text-cyan-700 bg-cyan-100 px-2 py-1 rounded-lg">
                    {hospital.doctorCount} doctors
                  </span>
                </div>
              ))}
              {!hospitals.length && (
                <p className="text-sm text-gray-400">No hospitals yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">
                Hospital Admin Coverage
              </h2>
              <Link
                to="/admin/hospital-admins"
                className="text-sky-600 text-xs flex items-center gap-1 hover:text-sky-700"
              >
                Manage <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-100 p-3 mb-3 bg-gradient-to-r from-indigo-50 to-sky-50">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Covered Hospitals
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {hospitalCoverage}
              </p>
            </div>
            <div className="space-y-2">
              {hospitalAdmins.slice(0, 6).map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {admin.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {admin.hospital || "No hospital assigned"}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-lg ${admin.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {!hospitalAdmins.length && (
                <p className="text-sm text-gray-400">No hospital admins yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-1 ${isSuperAdmin ? "xl:grid-cols-2" : "lg:grid-cols-2"} gap-6`}
      >
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <FiPieChart className="w-4 h-4 text-sky-500" /> Appointment Status
              Chart
            </h2>
          </div>
          <div className="h-64">
            {(appointmentsByStatus || []).length ? (
              <Doughnut
                data={appointmentStatusData}
                options={chartBaseOptions}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No appointment data available
              </div>
            )}
          </div>
        </div>

        {isSuperAdmin && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <FiBriefcase className="w-4 h-4 text-cyan-600" /> Doctors per
                Hospital
              </h2>
            </div>
            <div className="h-64">
              {hospitals.length ? (
                <Bar data={hospitalDoctorData} options={hospitalBarOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No hospital data available
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Status Breakdown */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">
            Appointments by Status
          </h2>
          <div className="space-y-3">
            {appointmentsByStatus?.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between">
                <StatusBadge status={status} />
                <span className="font-bold text-gray-700">{count}</span>
              </div>
            ))}
            {!appointmentsByStatus?.length && (
              <p className="text-gray-400 text-sm">No data</p>
            )}
          </div>
        </div>

        {/* Doctor Workload */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4">Top Doctors by Load</h2>
          <div className="space-y-3">
            {doctorWorkload?.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {d.doctorName}
                  </p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-sky-500 rounded-full h-1.5"
                      style={{
                        width: `${Math.min((d.totalAppointments / (doctorWorkload[0]?.totalAppointments || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-600">
                  {d.totalAppointments}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Recent Appointments</h2>
            <Link
              to="/admin/appointments"
              className="text-sky-500 text-xs flex items-center gap-1 hover:text-sky-700"
            >
              View all <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAppointments?.map((apt) => (
              <div
                key={apt._id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {apt.patient?.name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {apt.patient?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Dr. {apt.doctor?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {apt.appointmentDate
                      ? format(new Date(apt.appointmentDate), "dd MMM yyyy")
                      : ""}
                  </p>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div
        className={`grid grid-cols-2 ${isSuperAdmin ? "sm:grid-cols-3 xl:grid-cols-6" : "sm:grid-cols-4"} gap-4`}
      >
        {quickLinks.map(({ label, to, color }) => (
          <Link
            key={to}
            to={to}
            className={`bg-gradient-to-br ${color} text-white rounded-2xl p-4 text-center font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
