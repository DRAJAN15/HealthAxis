import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiCreditCard,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiHeart,
  FiSearch,
  FiActivity,
  FiBriefcase,
  FiShield,
} from "react-icons/fi";

const navConfig = {
  super_admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiHome },
    { label: "Hospitals", path: "/admin/hospitals", icon: FiBriefcase },
    {
      label: "Hospital Admins",
      path: "/admin/hospital-admins",
      icon: FiShield,
    },
    { label: "Doctors", path: "/admin/doctors", icon: FiUsers },
    { label: "Patients", path: "/admin/patients", icon: FiUser },
    { label: "Appointments", path: "/admin/appointments", icon: FiCalendar },
    { label: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
  ],
  hospital_admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiHome },
    { label: "Doctors", path: "/admin/doctors", icon: FiUsers },
    { label: "Patients", path: "/admin/patients", icon: FiUser },
    { label: "Appointments", path: "/admin/appointments", icon: FiCalendar },
    { label: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: FiHome },
    { label: "Doctors", path: "/admin/doctors", icon: FiUsers },
    { label: "Patients", path: "/admin/patients", icon: FiUser },
    { label: "Appointments", path: "/admin/appointments", icon: FiCalendar },
    { label: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor/dashboard", icon: FiHome },
    { label: "Appointments", path: "/doctor/appointments", icon: FiCalendar },
    { label: "Patients", path: "/doctor/patients", icon: FiUsers },
    { label: "Add Record", path: "/doctor/records/add", icon: FiFileText },
    { label: "Profile", path: "/doctor/profile", icon: FiUser },
  ],
  patient: [
    { label: "Dashboard", path: "/patient/dashboard", icon: FiHome },
    { label: "Find Doctors", path: "/patient/doctors", icon: FiSearch },
    { label: "Appointments", path: "/patient/appointments", icon: FiCalendar },
    { label: "Medical Records", path: "/patient/records", icon: FiFileText },
    { label: "Profile", path: "/patient/profile", icon: FiUser },
  ],
};

const roleColors = {
  super_admin: "from-rose-600 to-orange-500",
  hospital_admin: "from-indigo-600 to-blue-600",
  admin: "from-violet-600 to-indigo-600",
  doctor: "from-sky-500 to-cyan-500",
  patient: "from-emerald-500 to-teal-500",
};

const roleBadgeColors = {
  super_admin: "bg-rose-100 text-rose-700",
  hospital_admin: "bg-indigo-100 text-indigo-700",
  admin: "bg-violet-100 text-violet-700",
  doctor: "bg-sky-100 text-sky-700",
  patient: "bg-emerald-100 text-emerald-700",
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = navConfig[user?.role] || [];
  const gradient = roleColors[user?.role] || "from-sky-500 to-blue-600";
  const roleTitle =
    user?.role === "super_admin"
      ? "Super Admin Control Center"
      : user?.role === "hospital_admin"
        ? "Hospital Admin Console"
        : "HealthAxis";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`bg-gradient-to-br ${gradient} p-6`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FiHeart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">HealthAxis</p>
            <p className="text-white/70 text-xs mt-0.5">Hospital System</p>
          </div>
        </div>

        {/* User info */}
        <div className="mt-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm truncate max-w-[140px]">
              {user?.name}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColors[user?.role]} bg-white/90`}
            >
              {user?.role
                ? user.role
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ")
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                ? `bg-gradient-to-r ${gradient} text-white shadow-sm`
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <FiLogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-white shadow-xl">
            <SidebarContent />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiActivity className="w-4 h-4 text-sky-500" />
            <span>{roleTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
