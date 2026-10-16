import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mappingService } from '../services/mappingService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import DoctorBadge, { formatSpecialization } from '../components/DoctorBadge';
import {
  Link2,
  Plus,
  Search,
  Trash2,
  Users,
  Stethoscope,
} from 'lucide-react';

const MappingsList = () => {
  const [mappings, setMappings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ type: 'success', message: '' });

  // Modal State for New Assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Delete / Remove Assignment Modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mappingToDelete, setMappingToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mappingsRes, patientsRes, doctorsRes] = await Promise.all([
        mappingService.getAllUserMappings(),
        patientService.getAllPatients(),
        doctorService.getAllDoctors(),
      ]);

      setMappings(mappingsRes.data || []);
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);

      if (patientsRes.data && patientsRes.data.length > 0) {
        setSelectedPatientId(patientsRes.data[0].id.toString());
      }
      if (doctorsRes.data && doctorsRes.data.length > 0) {
        setSelectedDoctorId(doctorsRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Failed to load assignment data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = () => {
    if (patients.length === 0) {
      setAlert({
        type: 'error',
        message: 'Please add a patient first before creating an assignment.',
      });
      return;
    }
    if (doctors.length === 0) {
      setAlert({
        type: 'error',
        message: 'No doctors available for assignment.',
      });
      return;
    }
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) {
      setAlert({
        type: 'error',
        message: 'Both patient and doctor must be selected.',
      });
      return;
    }

    try {
      setAssignSubmitting(true);
      await mappingService.assignDoctor(selectedPatientId, selectedDoctorId);
      setAlert({
        type: 'success',
        message: 'Doctor successfully assigned to patient care team.',
      });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to create patient-doctor assignment.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleOpenDelete = (mapping) => {
    setMappingToDelete(mapping);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mappingToDelete) return;
    try {
      setDeleteSubmitting(true);
      await mappingService.removeMapping(mappingToDelete.id);
      setAlert({
        type: 'success',
        message: 'Care team assignment removed successfully.',
      });
      setIsDeleteDialogOpen(false);
      setMappingToDelete(null);
      fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to remove assignment.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredMappings = mappings.filter((m) => {
    const q = searchTerm.toLowerCase();
    const patientMatch = m.patient?.name?.toLowerCase().includes(q);
    const doctorMatch = m.doctor?.name?.toLowerCase().includes(q);
    const specMatch = m.doctor?.specialization?.toLowerCase().includes(q);
    return patientMatch || doctorMatch || specMatch;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Doctor Assignments Hub
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Coordinate and monitor all clinical relationships between patients and specialists.
          </p>
        </div>

        <button
          id="new-assignment-btn"
          className="btn btn-primary"
          onClick={handleOpenAssign}
        >
          <Plus size={17} />
          <span>New Assignment</span>
        </button>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, message: '' })}
        />
      )}

      {/* Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#ffffff',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            id="search-mappings-input"
            type="text"
            className="form-control"
            placeholder="Search by patient name, doctor name, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {filteredMappings.length} {filteredMappings.length === 1 ? 'assignment' : 'assignments'}
        </span>
      </div>

      {/* Mappings Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div className="spinner spinner-lg"></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>
            Retrieving assignment relationships...
          </p>
        </div>
      ) : filteredMappings.length === 0 ? (
        <div className="glass-card empty-state" style={{ background: '#ffffff' }}>
          <Link2 size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#0f172a' }}>
            {searchTerm ? 'No matching assignments found' : 'No active doctor assignments'}
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: '#64748b' }}>
            {searchTerm
              ? 'Try modifying your search query.'
              : 'Link a doctor to one of your patients to establish clinical mapping.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAssign}>
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Assigned Doctor</th>
                <th>Specialization</th>
                <th>Assigned Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMappings.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link
                      to={`/patients/${m.patient?.id}`}
                      style={{
                        fontWeight: 700,
                        color: '#0284c7',
                        textDecoration: 'none',
                      }}
                    >
                      {m.patient?.name}
                    </Link>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {m.patient?.age} yrs • {m.patient?.gender}
                    </p>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{m.doctor?.name}</span>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {m.doctor?.email}
                    </p>
                  </td>
                  <td>
                    {m.doctor && (
                      <DoctorBadge specialization={m.doctor.specialization} />
                    )}
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      title="Remove Assignment"
                      style={{ color: '#dc2626' }}
                      onClick={() => handleOpenDelete(m)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Doctor to Patient"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="select-patient">
              Select Patient *
            </label>
            <select
              id="select-patient"
              className="form-control"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age} yrs, {p.gender})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="select-doctor">
              Select Hospital Specialist *
            </label>
            <select
              id="select-doctor"
              className="form-control"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {formatSpecialization(d.specialization)}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAssignModalOpen(false)}
              disabled={assignSubmitting}
            >
              Cancel
            </button>
            <button
              id="submit-assignment-btn"
              type="submit"
              className="btn btn-primary"
              disabled={assignSubmitting}
            >
              {assignSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Remove Assignment Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Care Team Assignment"
        message={
          mappingToDelete
            ? `Are you sure you want to remove the assignment between patient "${mappingToDelete.patient?.name}" and doctor "${mappingToDelete.doctor?.name}"?`
            : 'Are you sure you want to remove this assignment?'
        }
        confirmText="Remove Assignment"
        loading={deleteSubmitting}
      />
    </div>
  );
};

export default MappingsList;
