import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMail, FiLock, FiHeart, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login(form.email, form.password);
    if (result.success) {
      const redirect = searchParams.get("redirect");
      if (redirect && result.role === "patient") {
        navigate(redirect);
        return;
      }

      const dashboardPath = ["super_admin", "hospital_admin", "admin"].includes(
        result.role,
      )
        ? "/admin/dashboard"
        : `/${result.role}/dashboard`;
      navigate(dashboardPath);
    }
  };

  // Quick demo login helper
  const demoLogin = (email, password) => {
    setForm({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <header className="pt-5 px-4 sticky top-0 z-20 backdrop-blur-xl bg-[#f4f6f8]/80">
        <div className="max-w-6xl mx-auto rounded-full border border-black/10 bg-white px-5 py-3 flex items-center justify-between shadow-sm">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-black text-slate-900"
          >
            <span className="h-5 w-5 rounded-full bg-black text-white inline-flex items-center justify-center text-[10px]">
              <FiHeart className="w-3 h-3" />
            </span>
            <span>HealthAxis</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold px-2 py-1 text-slate-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-black text-white px-3 py-1.5 text-xs font-semibold"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 pt-8 pb-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl shadow-lg mb-4">
              <FiHeart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">
              Sign in to HealthAxis
            </p>
          </div>

          {/* Card */}
          <div className="card shadow-lg border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className={`input-field pl-10 ${errors.email ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    className={`input-field pl-10 pr-10 ${errors.password ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-sky-600 font-medium hover:text-sky-700"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 card bg-gray-50 border-dashed border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Demo Credentials
            </p>
            <div className="space-y-2">
              {[
                {
                  role: "Super Admin",
                  email: "superadmin@hospital.com",
                  pass: "SuperAdmin@123",
                  color: "rose",
                },
                {
                  role: "Hospital Admin",
                  email: "hospitaladmin@hospital.com",
                  pass: "HospitalAdmin@123",
                  color: "indigo",
                },
                {
                  role: "Admin",
                  email: "admin@hospital.com",
                  pass: "Admin@123",
                  color: "violet",
                },
                {
                  role: "Doctor",
                  email: "arjun@hospital.com",
                  pass: "Doctor@123",
                  color: "sky",
                },
                {
                  role: "Patient",
                  email: "ravi@example.com",
                  pass: "Patient@123",
                  color: "emerald",
                },
              ].map(({ role, email, pass, color }) => (
                <button
                  key={role}
                  onClick={() => demoLogin(email, pass)}
                  className={`w-full text-left px-3 py-2 rounded-lg bg-${color}-50 border border-${color}-100 hover:bg-${color}-100 transition-colors`}
                >
                  <span className={`text-xs font-bold text-${color}-700`}>
                    {role}:{" "}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
