import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

type Stats = {
  totalClinics: number;
  activeClinics: number;
  totalDoctors: number;
  activeDoctors: number;
};

type RecentClinic = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

type RecentDoctor = {
  email: string;
  name: string;
  specialization: string;
  is_active: boolean;
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalClinics: 0,
    activeClinics: 0,
    totalDoctors: 0,
    activeDoctors: 0,
  });
  const [recentClinics, setRecentClinics] = useState<RecentClinic[]>([]);
  const [recentDoctors, setRecentDoctors] = useState<RecentDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [clinicsRes, doctorsRes] = await Promise.all([
        api.get("/clinics", { params: { limit: 100 } }),
        api.get("/doctors", { params: { limit: 100 } }),
      ]);

      const clinics = clinicsRes.data.clinics || [];
      const doctors = doctorsRes.data.doctors || [];

      setStats({
        totalClinics: clinics.length,
        activeClinics: clinics.filter((c: RecentClinic) => c.is_active).length,
        totalDoctors: doctors.length,
        activeDoctors: doctors.filter((d: RecentDoctor) => d.is_active).length,
      });

      setRecentClinics(clinics.slice(0, 5));
      setRecentDoctors(doctors.slice(0, 5));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to the Admin Portal. Here's an overview of your system.</p>
      </div>

      {loading ? (
        <div className="loading-row">
          <span className="spinner" aria-hidden /> Loading dashboard...
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalClinics}</span>
                <span className="stat-label">Total Clinics</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.activeClinics}</span>
                <span className="stat-label">Active Clinics</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalDoctors}</span>
                <span className="stat-label">Total Doctors</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-teal">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.activeDoctors}</span>
                <span className="stat-label">Active Doctors</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Clinics</h2>
                <a href="/clinics" className="card-link">View all →</a>
              </div>
              {recentClinics.length === 0 ? (
                <div className="empty-state-sm">
                  <p>No clinics yet</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentClinics.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>
                            <span className={`badge ${c.is_active ? "badge-active" : "badge-inactive"}`}>
                              {c.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Doctors</h2>
                <a href="/doctors" className="card-link">View all →</a>
              </div>
              {recentDoctors.length === 0 ? (
                <div className="empty-state-sm">
                  <p>No doctors yet</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDoctors.map((d) => (
                        <tr key={d.email}>
                          <td>{d.name}</td>
                          <td>{d.specialization}</td>
                          <td>
                            <span className={`badge ${d.is_active ? "badge-active" : "badge-inactive"}`}>
                              {d.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card quick-actions-card">
            <h2 className="card-title">Quick Actions</h2>
            <div className="quick-actions">
              <a href="/clinics" className="quick-action-btn">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Clinic
              </a>
              <a href="/doctors" className="quick-action-btn">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Doctor
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
