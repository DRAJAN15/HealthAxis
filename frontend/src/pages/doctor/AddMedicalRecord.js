import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordAPI, patientAPI, appointmentAPI } from "../../services/api";
import { PageHeader, Spinner } from "../../components/common";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const emptyPrescription = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  notes: "",
};

export default function AddMedicalRecord() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    appointmentId: "",
    diagnosis: "",
    symptoms: "",
    notes: "",
    followUpDate: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      height: "",
      oxygenSaturation: "",
    },
    prescriptions: [{ ...emptyPrescription }],
  });

  useEffect(() => {
    patientAPI.getAll().then((r) => setPatients(r.data.data));
    appointmentAPI
      .getAll({ status: "confirmed" })
      .then((r) => setAppointments(r.data.data));
  }, []);

  const addPrescription = () =>
    setForm({
      ...form,
      prescriptions: [...form.prescriptions, { ...emptyPrescription }],
    });
  const removePrescription = (i) =>
    setForm({
      ...form,
      prescriptions: form.prescriptions.filter((_, idx) => idx !== i),
    });
  const updatePrescription = (i, field, value) => {
    const p = [...form.prescriptions];
    p[i][field] = value;
    setForm({ ...form, prescriptions: p });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.diagnosis) {
      toast.error("Patient and diagnosis are required");
      return;
    }

    const cleanedPrescriptions = form.prescriptions
      .map((p) => ({
        medicine: p.medicine.trim(),
        dosage: p.dosage.trim(),
        frequency: p.frequency.trim(),
        duration: p.duration.trim(),
        notes: p.notes.trim(),
      }))
      .filter(
        (p) => p.medicine || p.dosage || p.frequency || p.duration || p.notes,
      );

    const hasInvalidPrescription = cleanedPrescriptions.some(
      (p) => !p.medicine || !p.dosage || !p.frequency || !p.duration,
    );
    if (hasInvalidPrescription) {
      toast.error(
        "Each prescription must include medicine, dosage, frequency, and duration",
      );
      return;
    }

    const toNumOrEmpty = (value) => (value === "" ? "" : Number(value));

    const cleanedVitals = {
      bloodPressure: form.vitals.bloodPressure.trim(),
      heartRate: toNumOrEmpty(form.vitals.heartRate),
      temperature: toNumOrEmpty(form.vitals.temperature),
      weight: toNumOrEmpty(form.vitals.weight),
      height: toNumOrEmpty(form.vitals.height),
      oxygenSaturation: toNumOrEmpty(form.vitals.oxygenSaturation),
    };

    setSaving(true);
    try {
      await recordAPI.create({
        ...form,
        symptoms: form.symptoms
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        vitals: cleanedVitals,
        prescriptions: cleanedPrescriptions,
      });
      toast.success("Medical record added successfully!");
      navigate("/doctor/appointments");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "input-field";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Add Medical Record"
        subtitle="Create a new patient medical record"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient & Appointment */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Patient *
              </label>
              <select
                required
                className={inputClass}
                value={form.patientId}
                onChange={(e) =>
                  setForm({ ...form, patientId: e.target.value })
                }
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Linked Appointment
              </label>
              <select
                className={inputClass}
                value={form.appointmentId}
                onChange={(e) =>
                  setForm({ ...form, appointmentId: e.target.value })
                }
              >
                <option value="">None</option>
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.patient?.name} –{" "}
                    {new Date(a.appointmentDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800">Diagnosis & Symptoms</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Diagnosis *
            </label>
            <input
              required
              className={inputClass}
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              placeholder="Primary diagnosis"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Symptoms (comma-separated)
            </label>
            <input
              className={inputClass}
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder="fever, headache, fatigue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Doctor Notes
            </label>
            <textarea
              rows={3}
              className={`${inputClass} resize-none`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional clinical notes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Follow-up Date
            </label>
            <input
              type="date"
              className={inputClass}
              value={form.followUpDate}
              onChange={(e) =>
                setForm({ ...form, followUpDate: e.target.value })
              }
            />
          </div>
        </div>

        {/* Vitals */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800">Vitals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                key: "bloodPressure",
                label: "Blood Pressure",
                placeholder: "120/80",
              },
              {
                key: "heartRate",
                label: "Heart Rate (bpm)",
                placeholder: "72",
              },
              {
                key: "temperature",
                label: "Temperature (°C)",
                placeholder: "98.6",
              },
              { key: "weight", label: "Weight (kg)", placeholder: "70" },
              { key: "height", label: "Height (cm)", placeholder: "175" },
              {
                key: "oxygenSaturation",
                label: "O₂ Saturation (%)",
                placeholder: "98",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {label}
                </label>
                <input
                  className={inputClass}
                  placeholder={placeholder}
                  value={form.vitals[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      vitals: { ...form.vitals, [key]: e.target.value },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptions */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Prescriptions</h2>
            <button
              type="button"
              onClick={addPrescription}
              className="flex items-center gap-1.5 text-sky-600 text-sm font-medium hover:text-sky-800"
            >
              <FiPlus className="w-4 h-4" /> Add Medicine
            </button>
          </div>
          {form.prescriptions.map((p, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">
                  Medicine #{i + 1}
                </span>
                {form.prescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrescription(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["medicine", "dosage", "frequency", "duration"].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                        {field}
                      </label>
                      <input
                        className={inputClass}
                        value={p[field]}
                        onChange={(e) =>
                          updatePrescription(i, field, e.target.value)
                        }
                        placeholder={
                          field === "medicine"
                            ? "Paracetamol 500mg"
                            : field === "dosage"
                              ? "1 tablet"
                              : field === "frequency"
                                ? "Twice daily"
                                : "5 days"
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? <Spinner size="sm" /> : "Save Medical Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
