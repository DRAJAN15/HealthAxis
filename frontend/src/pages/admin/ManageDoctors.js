import React, { useEffect, useState, useCallback } from "react";
import { doctorAPI } from "../../services/api";
import {
  PageHeader,
  Table,
  Modal,
  StatusBadge,
  Spinner,
} from "../../components/common";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  specialization: "",
  qualification: "",
  experience: "",
  consultationFee: "",
  bio: "",
  hospital: "City General Hospital",
  availability: [],
};

export default function ManageDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    doctor: null,
  });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const r = await doctorAPI.getManaged({ search });
      setDoctors(r.data.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const openCreate = () => {
    setForm({
      ...emptyForm,
      hospital:
        user?.role === "hospital_admin"
          ? user.hospital || ""
          : emptyForm.hospital,
    });
    setModal({ open: true, mode: "create", doctor: null });
  };

  const openEdit = (doc) => {
    setForm({
      name: doc.name || "",
      email: doc.email || "",
      password: "",
      phone: doc.phone || "",
      specialization: doc.profile?.specialization || "",
      qualification: doc.profile?.qualification || "",
      experience: doc.profile?.experience || "",
      consultationFee: doc.profile?.consultationFee || "",
      bio: doc.profile?.bio || "",
      hospital: doc.profile?.hospital || "",
      availability: doc.profile?.availability || [],
    });
    setModal({ open: true, mode: "edit", doctor: doc });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await doctorAPI.create(form);
        toast.success("Doctor added successfully!");
      } else {
        await doctorAPI.update(modal.doctor._id, form);
        toast.success("Doctor updated successfully!");
      }
      setModal({ open: false });
      fetchDoctors();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this doctor?")) return;
    try {
      await doctorAPI.delete(id);
      toast.success("Doctor deactivated");
      fetchDoctors();
    } catch {}
  };

  const columns = [
    {
      key: "name",
      label: "Doctor",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {r.name?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
            <p className="text-xs text-gray-400">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "specialization",
      label: "Specialization",
      render: (r) => r.profile?.specialization || "—",
    },
    {
      key: "experience",
      label: "Experience",
      render: (r) =>
        r.profile?.experience ? `${r.profile.experience} yrs` : "—",
    },
    {
      key: "fee",
      label: "Fee",
      render: (r) =>
        r.profile?.consultationFee ? `₹${r.profile.consultationFee}` : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${r.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
        >
          {r.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(r)}
            className="p-2 rounded-lg hover:bg-sky-50 text-sky-500 transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(r._id)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manage Doctors"
        subtitle={`${doctors.length} doctors registered`}
        action={
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" /> Add Doctor
          </button>
        }
      />

      {/* Search */}
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          className="input-field pl-10"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns}
          data={doctors}
          loading={loading}
          emptyTitle="No doctors found"
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === "create" ? "Add New Doctor" : "Edit Doctor"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Dr. John Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              required
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="doctor@hospital.com"
            />
          </div>
          {modal.mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                required
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 chars"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization *
            </label>
            <input
              required
              className="input-field"
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
              placeholder="e.g. Cardiology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Qualification *
            </label>
            <input
              required
              className="input-field"
              value={form.qualification}
              onChange={(e) =>
                setForm({ ...form, qualification: e.target.value })
              }
              placeholder="MBBS, MD"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience (years)
            </label>
            <input
              type="number"
              className="input-field"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Fee (₹) *
            </label>
            <input
              required
              type="number"
              className="input-field"
              value={form.consultationFee}
              onChange={(e) =>
                setForm({ ...form, consultationFee: e.target.value })
              }
              placeholder="500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital
            </label>
            <input
              className="input-field"
              value={form.hospital}
              disabled={user?.role === "hospital_admin"}
              onChange={(e) => setForm({ ...form, hospital: e.target.value })}
            />
            {user?.role === "hospital_admin" && (
              <p className="text-xs text-gray-500 mt-1">
                Hospital admins can manage doctors only for their assigned
                hospital.
              </p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={2}
              className="input-field resize-none"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Short bio..."
            />
          </div>

          <div className="col-span-2 flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setModal({ open: false })}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Spinner size="sm" />
              ) : modal.mode === "create" ? (
                "Add Doctor"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
