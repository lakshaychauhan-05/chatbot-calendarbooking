import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";

type Clinic = {
  id: string;
  name: string;
  timezone: string;
  address?: string | null;
  is_active: boolean;
  created_at: string;
};

type Doctor = {
  email: string;
  name: string;
  clinic_id: string;
  is_active: boolean;
};

const Clinics = () => {
  const { addToast } = useToast();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [forceDelete, setForceDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [manageClinic, setManageClinic] = useState<Clinic | null>(null);
  const [manageDoctors, setManageDoctors] = useState<Doctor[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [addDoctorEmail, setAddDoctorEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  const doctorCountByClinic = useMemo(() => {
    const map: Record<string, number> = {};
    doctors.forEach((d) => {
      map[d.clinic_id] = (map[d.clinic_id] || 0) + 1;
    });
    return map;
  }, [doctors]);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get("/clinics");
      setClinics(resp.data.clinics || []);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to load clinics";
      setError(Array.isArray(msg) ? msg[0]?.msg ?? msg : msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const resp = await api.get("/doctors", { params: { limit: 500 } });
      const list = resp.data.doctors || resp.data?.doctors || [];
      setDoctors(list);
    } catch {
      // ignore; doctor count will be 0
    }
  }, []);

  useEffect(() => {
    fetchClinics();
    fetchDoctors();
  }, [fetchClinics, fetchDoctors]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/clinics", {
        name,
        timezone,
        address: address || null,
        is_active: isActive,
      });
      addToast("Clinic created successfully", "success");
      setName("");
      setTimezone("UTC");
      setAddress("");
      setIsActive(true);
      fetchClinics();
      fetchDoctors();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to create clinic";
      setError(Array.isArray(msg) ? msg[0]?.msg ?? msg : msg);
    }
  };

  const toggleActive = async (clinic: Clinic) => {
    setError(null);
    try {
      await api.put(`/clinics/${clinic.id}`, { is_active: !clinic.is_active });
      addToast(clinic.is_active ? "Clinic deactivated" : "Clinic activated", "success");
      fetchClinics();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to update clinic";
      setError(Array.isArray(msg) ? msg[0]?.msg ?? msg : msg);
    }
  };

  const openDeleteConfirm = (c: Clinic) => {
    setDeleteTarget({ id: c.id, name: c.name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/clinics/${deleteTarget.id}`, { params: { force: forceDelete } });
      addToast("Clinic deleted", "success");
      setDeleteTarget(null);
      fetchClinics();
      fetchDoctors();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to delete clinic";
      setError(Array.isArray(msg) ? msg[0]?.msg ?? msg : msg);
      addToast(Array.isArray(msg) ? msg[0]?.msg ?? String(msg) : String(msg), "error");
    } finally {
      setDeleting(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id).then(
      () => addToast("Clinic ID copied to clipboard", "success"),
      () => addToast("Failed to copy", "error")
    );
  };

  const openManageDoctors = async (clinic: Clinic) => {
    setManageClinic(clinic);
    setAddDoctorEmail("");
    setManageLoading(true);
    try {
      const resp = await api.get("/doctors", { params: { clinic_id: clinic.id, limit: 200 } });
      setManageDoctors(resp.data.doctors || resp.data?.doctors || []);
    } catch {
      setManageDoctors([]);
    } finally {
      setManageLoading(false);
    }
  };

  const assignDoctorToClinic = async (e: FormEvent) => {
    e.preventDefault();
    if (!manageClinic || !addDoctorEmail.trim()) return;
    setAssigning(true);
    setError(null);
    try {
      await api.put(`/doctors/${encodeURIComponent(addDoctorEmail.trim())}`, {
        clinic_id: manageClinic.id,
      });
      addToast(`Doctor assigned to ${manageClinic.name}`, "success");
      setAddDoctorEmail("");
      const resp = await api.get("/doctors", { params: { clinic_id: manageClinic.id, limit: 200 } });
      setManageDoctors(resp.data.doctors || resp.data?.doctors || []);
      fetchDoctors();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to assign doctor";
      addToast(Array.isArray(msg) ? msg[0]?.msg ?? String(msg) : String(msg), "error");
    } finally {
      setAssigning(false);
    }
  };

  const removeDoctorFromClinic = async (doctorEmail: string, targetClinicId: string) => {
    setError(null);
    try {
      await api.delete(`/doctors/${encodeURIComponent(doctorEmail)}`);
      addToast("Doctor removed from clinic", "success");
      setManageDoctors((prev) => prev.filter((d) => d.email !== doctorEmail));
      fetchDoctors();
      fetchClinics();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to remove doctor";
      addToast(Array.isArray(msg) ? msg[0]?.msg ?? String(msg) : String(msg), "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Clinics</h1>
        <p>Create and manage clinics. Use clinic ID to add or remove doctors.</p>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Create clinic</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="clinic-name">Name</label>
            <input
              id="clinic-name"
              placeholder="Clinic name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="clinic-timezone">Timezone</label>
            <input
              id="clinic-timezone"
              placeholder="e.g. UTC, America/New_York"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="clinic-address">Address (optional)</label>
            <input
              id="clinic-address"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ justifyContent: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
          <div className="form-group" style={{ alignSelf: "end" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create clinic"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title">Existing clinics</h2>
        {loading ? (
          <div className="loading-row">
            <span className="spinner" aria-hidden /> Loading clinics…
          </div>
        ) : clinics.length === 0 ? (
          <div className="empty-state">
            <p>No clinics yet</p>
            <span>Create your first clinic using the form above.</span>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Clinic ID</th>
                    <th>Doctors</th>
                    <th>Timezone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clinics.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>
                        <div className="id-cell">
                          <span className="id-value" title={c.id}>
                            {c.id}
                          </span>
                          <button
                            type="button"
                            className="btn-secondary btn-sm btn-copy"
                            onClick={() => copyId(c.id)}
                            aria-label="Copy clinic ID"
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td>{doctorCountByClinic[c.id] ?? 0}</td>
                      <td>{c.timezone}</td>
                      <td>
                        <span className={`badge ${c.is_active ? "badge-active" : "badge-inactive"}`}>
                          {c.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="cell-actions">
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            onClick={() => openManageDoctors(c)}
                          >
                            Manage doctors
                          </button>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => toggleActive(c)}
                          >
                            {c.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => openDeleteConfirm(c)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <input
                type="checkbox"
                checked={forceDelete}
                onChange={(e) => setForceDelete(e.target.checked)}
              />
              Force delete clinics that have doctors (cascade delete)
            </label>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete clinic"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"?${
                forceDelete
                  ? " All doctors in this clinic will also be deleted."
                  : " You must remove all doctors first, or enable force delete."
              }`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
      />

      <Modal
        isOpen={!!manageClinic}
        onClose={() => setManageClinic(null)}
        title={manageClinic ? `Manage doctors — ${manageClinic.name}` : "Manage doctors"}
        size="lg"
      >
        {manageClinic && (
          <>
            <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              Clinic ID: <code style={{ background: "var(--secondary)", padding: "2px 6px", borderRadius: 4 }}>{manageClinic.id}</code>
            </p>
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 className="card-title">Add doctor to this clinic (by email)</h3>
              <p style={{ margin: "0 0 12px 0", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Enter an existing doctor&apos;s email to assign them to this clinic.
              </p>
              <form onSubmit={assignDoctorToClinic} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex: "1 1 200px", margin: 0 }}>
                  <label htmlFor="add-doctor-email">Doctor email</label>
                  <input
                    id="add-doctor-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={addDoctorEmail}
                    onChange={(e) => setAddDoctorEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={assigning}>
                  {assigning ? "Assigning…" : "Assign to this clinic"}
                </button>
              </form>
            </div>
            <h3 className="card-title">Doctors in this clinic</h3>
            {manageLoading ? (
              <div className="loading-row">Loading…</div>
            ) : manageDoctors.length === 0 ? (
              <div className="empty-state">
                <p>No doctors in this clinic</p>
                <span>Assign a doctor using the form above, or create one from the Doctors page.</span>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manageDoctors.map((d) => (
                      <tr key={d.email}>
                        <td>{d.name}</td>
                        <td>{d.email}</td>
                        <td>
                          <span className={`badge ${d.is_active ? "badge-active" : "badge-inactive"}`}>
                            {d.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => removeDoctorFromClinic(d.email, manageClinic.id)}
                          >
                            Remove from clinic
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default Clinics;
