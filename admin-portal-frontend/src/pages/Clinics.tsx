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

  // Create form state
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  // Edit modal state
  const [editClinic, setEditClinic] = useState<Clinic | null>(null);
  const [editName, setEditName] = useState("");
  const [editTimezone, setEditTimezone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Delete state
  const [forceDelete, setForceDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Manage doctors modal state
  const [manageClinic, setManageClinic] = useState<Clinic | null>(null);
  const [manageDoctors, setManageDoctors] = useState<Doctor[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [addDoctorEmail, setAddDoctorEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const doctorCountByClinic = useMemo(() => {
    const map: Record<string, number> = {};
    doctors.forEach((d) => {
      map[d.clinic_id] = (map[d.clinic_id] || 0) + 1;
    });
    return map;
  }, [doctors]);

  const filteredClinics = useMemo(() => {
    if (!searchQuery.trim()) return clinics;
    const q = searchQuery.toLowerCase();
    return clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [clinics, searchQuery]);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get("/clinics");
      setClinics(resp.data.clinics || []);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to load clinics";
      setError(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const resp = await api.get("/doctors", { params: { limit: 200 } });
      const list = resp.data.doctors || [];
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
    setCreating(true);
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to create clinic";
      setError(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg));
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (clinic: Clinic) => {
    setEditClinic(clinic);
    setEditName(clinic.name);
    setEditTimezone(clinic.timezone);
    setEditAddress(clinic.address || "");
    setEditIsActive(clinic.is_active);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editClinic) return;
    setUpdating(true);
    setError(null);
    try {
      await api.put(`/clinics/${editClinic.id}`, {
        name: editName,
        timezone: editTimezone,
        address: editAddress || null,
        is_active: editIsActive,
      });
      addToast("Clinic updated successfully", "success");
      setEditClinic(null);
      fetchClinics();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to update clinic";
      addToast(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg), "error");
    } finally {
      setUpdating(false);
    }
  };

  const toggleActive = async (clinic: Clinic) => {
    setError(null);
    try {
      await api.put(`/clinics/${clinic.id}`, { is_active: !clinic.is_active });
      addToast(clinic.is_active ? "Clinic deactivated" : "Clinic activated", "success");
      fetchClinics();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to update clinic";
      setError(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg));
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to delete clinic";
      setError(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg));
      addToast(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg), "error");
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
      setManageDoctors(resp.data.doctors || []);
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
      setManageDoctors(resp.data.doctors || []);
      fetchDoctors();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to assign doctor";
      addToast(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg), "error");
    } finally {
      setAssigning(false);
    }
  };

  const removeDoctorFromClinic = async (doctorEmail: string) => {
    setError(null);
    try {
      await api.delete(`/doctors/${encodeURIComponent(doctorEmail)}`);
      addToast("Doctor removed from clinic", "success");
      setManageDoctors((prev) => prev.filter((d) => d.email !== doctorEmail));
      fetchDoctors();
      fetchClinics();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to remove doctor";
      addToast(Array.isArray(msg) ? (msg as { msg: string }[])[0]?.msg ?? String(msg) : String(msg), "error");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Clinics</h1>
        <p>Create and manage clinics. Each clinic can have multiple doctors assigned.</p>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Create New Clinic</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="clinic-name">Clinic Name</label>
            <input
              id="clinic-name"
              placeholder="Enter clinic name"
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
            <label htmlFor="clinic-address">Address (Optional)</label>
            <input
              id="clinic-address"
              placeholder="Enter address"
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
                style={{ width: "auto" }}
              />
              Active
            </label>
          </div>
          <div className="form-group" style={{ alignSelf: "end" }}>
            <button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Clinic"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Clinics</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="search"
              placeholder="Search clinics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 240 }}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-row">
            <span className="spinner" aria-hidden /> Loading clinics...
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="empty-state">
            <p>{searchQuery ? "No matching clinics found" : "No clinics yet"}</p>
            <span>{searchQuery ? "Try a different search term." : "Create your first clinic using the form above."}</span>
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
                  {filteredClinics.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                        {c.address && (
                          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>
                            {c.address}
                          </div>
                        )}
                      </td>
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
                      <td>
                        <span style={{ fontWeight: 600 }}>{doctorCountByClinic[c.id] ?? 0}</span>
                      </td>
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
                            className="btn-outline btn-sm"
                            onClick={() => openEditModal(c)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            onClick={() => openManageDoctors(c)}
                          >
                            Doctors
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
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <input
                type="checkbox"
                checked={forceDelete}
                onChange={(e) => setForceDelete(e.target.checked)}
                style={{ width: "auto" }}
              />
              Enable force delete (cascade deletes all doctors in clinic)
            </label>
          </>
        )}
      </div>

      {/* Edit Clinic Modal */}
      <Modal
        isOpen={!!editClinic}
        onClose={() => setEditClinic(null)}
        title="Edit Clinic"
        size="md"
      >
        {editClinic && (
          <form onSubmit={handleUpdate}>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
              <div className="form-group">
                <label htmlFor="edit-clinic-name">Clinic Name</label>
                <input
                  id="edit-clinic-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-clinic-timezone">Timezone</label>
                <input
                  id="edit-clinic-timezone"
                  value={editTimezone}
                  onChange={(e) => setEditTimezone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-clinic-address">Address</label>
                <input
                  id="edit-clinic-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    style={{ width: "auto" }}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="confirm-actions" style={{ marginTop: 24 }}>
              <button type="button" className="btn-secondary" onClick={() => setEditClinic(null)}>
                Cancel
              </button>
              <button type="submit" disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Clinic"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?${
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

      {/* Manage Doctors Modal */}
      <Modal
        isOpen={!!manageClinic}
        onClose={() => setManageClinic(null)}
        title={manageClinic ? `Manage Doctors - ${manageClinic.name}` : "Manage Doctors"}
        size="lg"
      >
        {manageClinic && (
          <>
            <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              Clinic ID: <code style={{ background: "var(--secondary)", padding: "2px 8px", borderRadius: 4, fontSize: "0.8125rem" }}>{manageClinic.id}</code>
            </p>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 className="card-title" style={{ fontSize: "1rem" }}>Add Doctor to Clinic</h3>
              <form onSubmit={assignDoctorToClinic} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex: "1 1 250px", margin: 0 }}>
                  <label htmlFor="add-doctor-email">Doctor Email</label>
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
                  {assigning ? "Adding..." : "Add Doctor"}
                </button>
              </form>
            </div>
            <h3 className="card-title" style={{ fontSize: "1rem", marginBottom: 12 }}>Doctors in this Clinic</h3>
            {manageLoading ? (
              <div className="loading-row">Loading...</div>
            ) : manageDoctors.length === 0 ? (
              <div className="empty-state-sm">
                <p>No doctors in this clinic yet</p>
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
                            onClick={() => removeDoctorFromClinic(d.email)}
                          >
                            Remove
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
