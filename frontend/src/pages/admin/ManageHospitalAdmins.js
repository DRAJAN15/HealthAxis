import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { Modal, PageHeader, Spinner, Table } from "../../components/common";
import { userAPI } from "../../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  hospital: "",
  isActive: true,
};

export default function ManageHospitalAdmins() {
  const [admins, setAdmins] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    row: null,
  });
  const [form, setForm] = useState(emptyForm);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getHospitalAdmins();
      setAdmins(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  useEffect(() => {
    userAPI.getHospitals().then((res) => setHospitals(res.data.data || []));
  }, []);

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) =>
      [a.name, a.email, a.hospital].some((val) =>
        (val || "").toLowerCase().includes(q),
      ),
    );
  }, [admins, search]);

  const activeAdminsCount = useMemo(
    () => filteredAdmins.filter((a) => a.isActive).length,
    [filteredAdmins],
  );
  const coveredHospitalsCount = useMemo(() => {
    const set = new Set(filteredAdmins.map((a) => a.hospital).filter(Boolean));
    return set.size;
  }, [filteredAdmins]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, mode: "create", row: null });
  };

  const openEdit = (row) => {
    setForm({
      name: row.name || "",
      email: row.email || "",
      password: "",
      phone: row.phone || "",
      hospital: row.hospital || "",
      isActive: !!row.isActive,
    });
    setModal({ open: true, mode: "edit", row });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await userAPI.createHospitalAdmin(form);
        toast.success("Hospital admin created");
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          hospital: form.hospital,
          isActive: form.isActive,
        };
        if (form.password) payload.password = form.password;

        await userAPI.updateHospitalAdmin(modal.row._id, payload);
        toast.success("Hospital admin updated");
      }
      setModal({ open: false, mode: "create", row: null });
      fetchAdmins();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (row) => {
    await userAPI.toggleActive(row._id);
    toast.success(
      `Hospital admin ${row.isActive ? "deactivated" : "activated"}`,
    );
    fetchAdmins();
  };

  const columns = [
    {
      key: "name",
      label: "Hospital Admin",
      render: (r) => (
        <div>
          <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      ),
    },
    { key: "hospital", label: "Hospital", render: (r) => r.hospital || "—" },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
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
            className="p-2 rounded-lg hover:bg-sky-50 text-sky-500"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleStatus(r)}
            className={`p-2 rounded-lg ${r.isActive ? "hover:bg-red-50 text-red-500" : "hover:bg-emerald-50 text-emerald-600"}`}
            title={r.isActive ? "Deactivate" : "Activate"}
          >
            {r.isActive ? (
              <FiUserX className="w-4 h-4" />
            ) : (
              <FiUserCheck className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-6 md:p-7 bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-white/80 font-semibold">
          Super Admin
        </p>
        <h1 className="text-2xl md:text-3xl font-black mt-1">
          Hospital Admin Governance
        </h1>
        <p className="text-sm text-white/90 mt-2 max-w-2xl">
          Control access owners for each hospital. Active admins can manage
          doctors and patients within their assigned hospital scope.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-rose-50 border-rose-100">
          <p className="text-xs text-rose-700 uppercase tracking-wide">
            Total Admins
          </p>
          <p className="text-3xl font-black text-rose-900 mt-1">
            {filteredAdmins.length}
          </p>
        </div>
        <div className="card bg-emerald-50 border-emerald-100">
          <p className="text-xs text-emerald-700 uppercase tracking-wide">
            Active Admins
          </p>
          <p className="text-3xl font-black text-emerald-900 mt-1">
            {activeAdminsCount}
          </p>
        </div>
        <div className="card bg-indigo-50 border-indigo-100">
          <p className="text-xs text-indigo-700 uppercase tracking-wide">
            Hospitals Covered
          </p>
          <p className="text-3xl font-black text-indigo-900 mt-1">
            {coveredHospitalsCount}
          </p>
        </div>
      </div>

      <PageHeader
        title="Manage Hospital Admins"
        subtitle={`${filteredAdmins.length} hospital admins`}
        action={
          <button
            onClick={openCreate}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" /> Add Hospital Admin
          </button>
        }
      />

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          className="input-field pl-10"
          placeholder="Search by name, email, hospital"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns}
          data={filteredAdmins}
          loading={loading}
          emptyTitle="No hospital admins found"
        />
      </div>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: "create", row: null })}
        title={
          modal.mode === "create"
            ? "Create Hospital Admin"
            : "Edit Hospital Admin"
        }
        size="lg"
      >
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital *
            </label>
            <select
              required
              className="input-field"
              value={form.hospital}
              onChange={(e) => setForm({ ...form, hospital: e.target.value })}
            >
              <option value="">Select hospital</option>
              {hospitals.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {modal.mode === "create" ? "*" : ""}
            </label>
            <input
              type="password"
              className="input-field"
              required={modal.mode === "create"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={
                modal.mode === "edit"
                  ? "Leave empty to keep same password"
                  : "Set password"
              }
            />
          </div>

          {modal.mode === "edit" && (
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active account
              </label>
            </div>
          )}

          <div className="col-span-2 flex gap-3 mt-2">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() =>
                setModal({ open: false, mode: "create", row: null })
              }
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
                "Create"
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
