import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hms_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle responses and errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";

    if (error.response?.status === 401) {
      localStorage.removeItem("hms_token");
      localStorage.removeItem("hms_user");
      window.location.href = "/login";
    }

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updatePassword: (data) => API.put("/auth/update-password", data),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────
export const doctorAPI = {
  getAll: (params) => API.get("/doctors", { params }),
  getManaged: (params) => API.get("/doctors/manage", { params }),
  getOne: (id) => API.get(`/doctors/${id}`),
  create: (data) => API.post("/doctors", data),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  delete: (id) => API.delete(`/doctors/${id}`),
  getAvailableSlots: (id, date) =>
    API.get(`/doctors/${id}/slots`, { params: { date } }),
};

// ─── Hospitals (Public) ──────────────────────────────────────────────────────
export const hospitalAPI = {
  getAll: () => API.get("/hospitals"),
  getOne: (name) => API.get(`/hospitals/${encodeURIComponent(name)}`),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientAPI = {
  getAll: (params) => API.get("/patients", { params }),
  getOne: (id) => API.get(`/patients/${id}`),
  getMe: () => API.get("/patients/me"),
  update: (id, data) => API.put(`/patients/${id}`, data),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentAPI = {
  book: (data) => API.post("/appointments", data),
  getAll: (params) => API.get("/appointments", { params }),
  getOne: (id) => API.get(`/appointments/${id}`),
  updateStatus: (id, data) => API.put(`/appointments/${id}/status`, data),
  cancel: (id, data) => API.put(`/appointments/${id}/cancel`, data),
};

// ─── Medical Records ──────────────────────────────────────────────────────────
export const recordAPI = {
  create: (data) => API.post("/records", data),
  getAll: (params) => API.get("/records", { params }),
  getOne: (id) => API.get(`/records/${id}`),
  update: (id, data) => API.put(`/records/${id}`, data),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (data) => API.post("/payments/create-order", data),
  verifyPayment: (data) => API.post("/payments/verify", data),
  getAll: () => API.get("/payments"),
  getOne: (id) => API.get(`/payments/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => API.get("/analytics/dashboard"),
  getDoctorAnalytics: () => API.get("/analytics/doctor"),
  getPatientAnalytics: () => API.get("/analytics/patient"),
};

// ─── Users / Super Admin ─────────────────────────────────────────────────────
export const userAPI = {
  getAll: () => API.get("/users"),
  getHospitalAdmins: () => API.get("/users/hospital-admins"),
  createHospitalAdmin: (data) => API.post("/users/hospital-admins", data),
  updateHospitalAdmin: (id, data) =>
    API.put(`/users/hospital-admins/${id}`, data),
  toggleActive: (id) => API.put(`/users/${id}/toggle-active`),
  getHospitals: () => API.get("/users/hospitals"),
  createHospital: (data) => API.post("/users/hospitals", data),
  renameHospital: (data) => API.put("/users/hospitals/rename", data),
};

export default API;
