import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { mappingService } from '../services/mappingService';
import StatCard from '../components/StatCard';
import DoctorBadge from '../components/DoctorBadge';
import {
  Users,
  Stethoscope,
  Link2,
  PlusCircle,
  ArrowRight,
  Eye,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [patientsRes, doctorsRes, mappingsRes] = await Promise.all([
        patientService.getAllPatients(),
        doctorService.getAllDoctors(),
        mappingService.getAllUserMappings(),
      ]);

      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setMappings(mappingsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to fetch clinical data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Welcome Hero Banner */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderColor: '#bae6fd',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.6rem', background: '#ffffff', borderColor: '#bae6fd' }}>
            Clinical Practitioner Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome, {user?.name ? user.name.replace(/^(dr\.?|doctor)\s+/i, '') : 'User'}
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Overview of your active clinical roster, doctor assignments, and patient treatment teams.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/patients" className="btn btn-primary">
            <PlusCircle size={17} />
            <span>Manage Patients</span>
          </Link>
          <Link to="/mappings" className="btn btn-secondary">
            <Link2 size={17} />
            <span>Assign Doctor</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Active Patients"
          value={loading ? '...' : patients.length}
          icon={Users}
          color="#0284c7"
          subtitle="Managed in your registry"
        />
        <StatCard
          title="Hospital Specialists"
          value={loading ? '...' : doctors.length}
          icon={Stethoscope}
          color="#16a34a"
          subtitle="Available for consultation"
        />
        <StatCard
          title="Care Team Links"
          value={loading ? '...' : mappings.length}
          icon={Link2}
          color="#7e22ce"
          subtitle="Active patient-doctor mappings"
        />
      </div>

      {/* Main Content Split: Recent Patients & Recent Assignments */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Patients Section */}
        <div className="glass-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                Recent Patient Records
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Latest profiles added under your care
              </p>
            </div>
            <Link
              to="/patients"
              style={{
                fontSize: '0.85rem',
                color: '#0284c7',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner"></div>
            </div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <Users size={38} className="empty-state-icon" />
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                No patient records yet
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#64748b' }}>
                Add your first patient profile to begin clinical management.
              </p>
              <Link to="/patients" className="btn btn-primary btn-sm">
                <PlusCircle size={15} /> Add Patient
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Assigned Doctors</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link
                          to={`/patients/${p.id}`}
                          style={{ color: '#0f172a', textDecoration: 'none' }}
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td style={{ color: '#475569' }}>
                        {p.age} yrs • {p.gender}
                      </td>
                      <td>
                        {p.doctors && p.doctors.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {p.doctors.slice(0, 2).map((d) => (
                              <DoctorBadge key={d.id} specialization={d.specialization} />
                            ))}
                            {p.doctors.length > 2 && (
                              <span className="badge badge-primary">
                                +{p.doctors.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.825rem' }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/patients/${p.id}`}
                          className="btn btn-secondary btn-icon"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Doctor Assignments Section */}
        <div className="glass-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                Active Care Team Links
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Established doctor-patient assignments
              </p>
            </div>
            <Link
              to="/mappings"
              style={{
                fontSize: '0.85rem',
                color: '#0284c7',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner"></div>
            </div>
          ) : mappings.length === 0 ? (
            <div className="empty-state">
              <Link2 size={38} className="empty-state-icon" />
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                No active assignments
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#64748b' }}>
                Assign an available hospital doctor to one of your patients.
              </p>
              <Link to="/mappings" className="btn btn-primary btn-sm">
                <Link2 size={15} /> Assign Doctor Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mappings.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                      {m.patient?.name}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Assigned to <span style={{ color: '#0284c7', fontWeight: 600 }}>{m.doctor?.name}</span>
                    </p>
                  </div>
                  <div>
                    {m.doctor && (
                      <DoctorBadge specialization={m.doctor.specialization} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
