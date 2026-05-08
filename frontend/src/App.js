import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LandingPage from "./pages/public/LandingPage";
import HospitalPage from "./pages/public/HospitalPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManagePatients from "./pages/admin/ManagePatients";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import ManageHospitals from "./pages/admin/ManageHospitals";
import ManageHospitalAdmins from "./pages/admin/ManageHospitalAdmins";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import AddMedicalRecord from "./pages/doctor/AddMedicalRecord";
import DoctorProfile from "./pages/doctor/DoctorProfile";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import FindDoctors from "./pages/patient/FindDoctors";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";
import MyMedicalRecords from "./pages/patient/MyMedicalRecords";
import PaymentPage from "./pages/patient/PaymentPage";
import PatientProfile from "./pages/patient/PatientProfile";

// Layout
import DashboardLayout from "./components/common/DashboardLayout";

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, initializing } = useAuth();
  if (initializing)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
};

const getDashboardPath = (role) => {
  if (["super_admin", "hospital_admin", "admin"].includes(role))
    return "/admin/dashboard";
  if (role === "doctor") return "/doctor/dashboard";
  if (role === "patient") return "/patient/dashboard";
  return "/login";
};

// ─── Public Route (redirect if logged in) ────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { user, initializing } = useAuth();
  if (initializing) return null;
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/hospitals/:hospitalName" element={<HospitalPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* ── Admin ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={["super_admin", "hospital_admin", "admin"]}
          >
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route
          path="hospitals"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <ManageHospitals />
            </ProtectedRoute>
          }
        />
        <Route
          path="hospital-admins"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <ManageHospitalAdmins />
            </ProtectedRoute>
          }
        />
        <Route path="doctors" element={<ManageDoctors />} />
        <Route path="patients" element={<ManagePatients />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
      </Route>

      {/* ── Doctor ── */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="records/add" element={<AddMedicalRecord />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      {/* ── Patient ── */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="doctors" element={<FindDoctors />} />
        <Route path="book/:doctorId" element={<BookAppointment />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="records" element={<MyMedicalRecords />} />
        <Route path="payment/:appointmentId" element={<PaymentPage />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
