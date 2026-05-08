import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiBriefcase,
  FiUserCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { Modal, PageHeader, Spinner, Table } from "../../components/common";
import { userAPI } from "../../services/api";

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ open: false, from: "", to: "" });
  const [addModal, setAddModal] = useState({ open: false, name: "" });

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getHospitals();
      setHospitals(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const filteredHospitals = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) => (h.name || "").toLowerCase().includes(q));
  }, [hospitals, search]);

  const totalDoctors = useMemo(
    () => hospitals.reduce((sum, h) => sum + (h.doctorCount || 0), 0),
    [hospitals],
  );

  const avgDoctors = hospitals.length
    ? Math.round((totalDoctors / hospitals.length) * 10) / 10
    : 0;

  const openRename = (name) => setModal({ open: true, from: name, to: name });

  const addHospital = async (e) => {
    e.preventDefault();
    const name = addModal.name.trim();
    if (!name) return;

    setAdding(true);
    try {
      await userAPI.createHospital({ name });
      toast.success("Hospital added successfully");
      setAddModal({ open: false, name: "" });
      fetchHospitals();
    } finally {
      setAdding(false);
    }
  };

  const renameHospital = async (e) => {
    e.preventDefault();
    if (!modal.from || !modal.to) return;
    if (modal.from === modal.to) {
      toast.error("New hospital name must be different");
      return;
    }

    setSaving(true);
    try {
      await userAPI.renameHospital({ from: modal.from, to: modal.to });
      toast.success("Hospital renamed successfully");
      setModal({ open: false, from: "", to: "" });
      fetchHospitals();
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Hospital Name",
      render: (r) => (
        <span className="font-semibold text-gray-800">{r.name}</span>
      ),
    },
    {
      key: "doctorCount",
      label: "Doctors",
      render: (r) => (
        <span className="font-semibold text-cyan-700">{r.doctorCount}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <button
          onClick={() => openRename(r.name)}
          className="p-2 rounded-lg hover:bg-sky-50 text-sky-600"
          title="Rename hospital"
        >
          <FiEdit2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-6 md:p-7 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white shadow-sm">
        <p className="text-xs uppercase tracking-wide text-white/80 font-semibold">
          Super Admin
        </p>
        <h1 className="text-2xl md:text-3xl font-black mt-1">
          Hospital Directory Management
        </h1>
        <p className="text-sm text-white/90 mt-2 max-w-2xl">
          Add and organize hospitals across the network. Hospital admins and
          doctors are mapped to these hospital entities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-cyan-50 border-cyan-100">
          <p className="text-xs text-cyan-700 uppercase tracking-wide">
            Hospitals
          </p>
          <p className="text-3xl font-black text-cyan-900 mt-1">
            {hospitals.length}
          </p>
        </div>
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-xs text-blue-700 uppercase tracking-wide">
            Doctors Mapped
          </p>
          <p className="text-3xl font-black text-blue-900 mt-1">
            {totalDoctors}
          </p>
        </div>
        <div className="card bg-indigo-50 border-indigo-100">
          <p className="text-xs text-indigo-700 uppercase tracking-wide">
            Avg Doctors/Hospital
          </p>
          <p className="text-3xl font-black text-indigo-900 mt-1">
            {avgDoctors}
          </p>
        </div>
      </div>

      <PageHeader
        title="Manage Hospitals"
        subtitle={`${filteredHospitals.length} hospitals found`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setAddModal({ open: true, name: "" })}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" /> Add Hospital
            </button>
            <button
              onClick={fetchHospitals}
              className="btn-secondary flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          className="input-field pl-10"
          placeholder="Search hospitals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns}
          data={filteredHospitals}
          loading={loading}
          emptyTitle="No hospitals found"
        />
      </div>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, from: "", to: "" })}
        title="Rename Hospital"
      >
        <form onSubmit={renameHospital} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Name
            </label>
            <input
              className="input-field bg-gray-50"
              value={modal.from}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Name *
            </label>
            <input
              className="input-field"
              required
              value={modal.to}
              onChange={(e) => setModal((m) => ({ ...m, to: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModal({ open: false, from: "", to: "" })}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? <Spinner size="sm" /> : "Rename Hospital"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={addModal.open}
        onClose={() => setAddModal({ open: false, name: "" })}
        title="Add Hospital"
      >
        <form onSubmit={addHospital} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Name *
            </label>
            <input
              className="input-field"
              required
              value={addModal.name}
              onChange={(e) =>
                setAddModal({ open: true, name: e.target.value })
              }
              placeholder="Enter hospital name"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddModal({ open: false, name: "" })}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adding}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {adding ? <Spinner size="sm" /> : "Add Hospital"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
