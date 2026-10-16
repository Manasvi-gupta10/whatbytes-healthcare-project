import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { mappingService } from '../services/mappingService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import DoctorBadge, { formatSpecialization } from '../components/DoctorBadge';
import {
  ArrowLeft,
  MapPin,
  Stethoscope,
  Plus,
  Trash2,
  Edit2,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: 'success', message: '' });

  // Assign Doctor Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Unassign Mapping Confirmation
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);
  const [mappingToUnassign, setMappingToUnassign] = useState(null);
  const [unassignSubmitting, setUnassignSubmitting] = useState(false);

  // Edit Patient Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    address: '',
    medicalDetails: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Patient Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [patientRes, mappingsRes, doctorsRes] = await Promise.all([
        patientService.getPatientById(id),
        mappingService.getDoctorsByPatient(id),
        doctorService.getAllDoctors(),
      ]);

      setPatient(patientRes.data);
      setAssignedDoctors(mappingsRes.data || []);
      setAvailableDoctors(doctorsRes.data || []);

      setEditFormData({
        name: patientRes.data.name,
        age: patientRes.data.age,
        gender: patientRes.data.gender,
        address: patientRes.data.address,
        medicalDetails: patientRes.data.medicalDetails || '',
      });
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Failed to load patient profile or unauthorized access.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = () => {
    const assignedDoctorIds = new Set(assignedDoctors.map((m) => m.doctor?.id));
    const unassigned = availableDoctors.filter((d) => !assignedDoctorIds.has(d.id));

    if (unassigned.length > 0) {
      setSelectedDoctorId(unassigned[0].id.toString());
    } else {
      setSelectedDoctorId('');
    }
    setIsAssignModalOpen(true);
  };

  const handleAssignDoctor = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setAlert({ type: 'error', message: 'Please select a doctor to assign.' });
      return;
    }

    try {
      setAssignSubmitting(true);
      await mappingService.assignDoctor(id, selectedDoctorId);
      setAlert({
        type: 'success',
        message: 'Doctor assigned to patient care team successfully.',
      });
      setIsAssignModalOpen(false);
      fetchPatientData();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to assign doctor to patient.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleOpenUnassign = (mapping) => {
    setMappingToUnassign(mapping);
    setIsUnassignDialogOpen(true);
  };

  const handleConfirmUnassign = async () => {
    if (!mappingToUnassign) return;
    try {
      setUnassignSubmitting(true);
      await mappingService.removeMapping(mappingToUnassign.id);
      setAlert({
        type: 'success',
        message: 'Doctor unassigned from care team successfully.',
      });
      setIsUnassignDialogOpen(false);
      setMappingToUnassign(null);
      fetchPatientData();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to remove doctor assignment.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setUnassignSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditSubmitting(true);
      await patientService.updatePatient(id, editFormData);
      setAlert({
        type: 'success',
        message: 'Patient profile updated successfully.',
      });
      setIsEditModalOpen(false);
      fetchPatientData();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update patient profile.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleConfirmDeletePatient = async () => {
    try {
      setDeleteSubmitting(true);
      await patientService.deletePatient(id);
      navigate('/patients', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to delete patient profile.';
      setAlert({ type: 'error', message: msg });
      setIsDeleteDialogOpen(false);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="spinner spinner-lg"></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>
          Loading clinical patient records...
        </p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="page-wrapper">
        <Link to="/patients" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Patients
        </Link>
        <div className="glass-card empty-state" style={{ background: '#ffffff' }}>
          <AlertCircle size={44} className="empty-state-icon" style={{ color: '#dc2626' }} />
          <h3 style={{ color: '#0f172a' }}>Patient Not Found</h3>
          <p style={{ color: '#64748b' }}>This patient record does not exist or you do not have permission to view it.</p>
        </div>
      </div>
    );
  }

  const assignedDoctorIds = new Set(assignedDoctors.map((m) => m.doctor?.id));
  const unassignedDoctors = availableDoctors.filter((d) => !assignedDoctorIds.has(d.id));

  return (
    <div className="page-wrapper">
      {/* Top Breadcrumb & Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Link to="/patients" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Patients
        </Link>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit2 size={15} /> Edit Patient
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 size={15} /> Delete Record
          </button>
        </div>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, message: '' })}
        />
      )}

      {/* Grid: Patient Info Summary & Assigned Care Team */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Patient Core Profile Card */}
        <div className="glass-card" style={{ background: '#ffffff' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              paddingBottom: '1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-lg)',
                background: '#e0f2fe',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                fontSize: '1.4rem',
                fontWeight: 800,
              }}
            >
              {patient.name.charAt(0)}
            </div>

            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
                Record ID: #{patient.id}
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{patient.name}</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {patient.age} years old • {patient.gender}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Residential Address
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <MapPin size={16} style={{ color: '#0284c7', flexShrink: 0 }} />
                <span style={{ fontSize: '0.925rem', color: '#0f172a' }}>
                  {patient.address}
                </span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Clinical & Medical History
              </p>
              <div
                style={{
                  marginTop: '0.4rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  color: patient.medicalDetails ? '#1e293b' : '#64748b',
                  lineHeight: 1.6,
                }}
              >
                {patient.medicalDetails || 'No additional clinical history or notes recorded.'}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Registered on: {new Date(patient.createdAt).toLocaleDateString()} at{' '}
              {new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Assigned Doctors (Care Team) */}
        <div className="glass-card" style={{ background: '#ffffff' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Care Team Specialists</h2>
              <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Assigned practitioners for {patient.name}
              </p>
            </div>

            <button
              id="assign-doctor-btn"
              className="btn btn-primary btn-sm"
              onClick={handleOpenAssign}
            >
              <Plus size={15} /> Assign Specialist
            </button>
          </div>

          {assignedDoctors.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <Stethoscope size={40} className="empty-state-icon" />
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                No specialists assigned yet
              </p>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#64748b' }}>
                Assign an available doctor to coordinate treatments and consultations.
              </p>
              <button className="btn btn-primary btn-sm" onClick={handleOpenAssign}>
                <Plus size={15} /> Assign Specialist Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {assignedDoctors.map((mapping) => (
                <div
                  key={mapping.id}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0f172a' }}>
                        {mapping.doctor?.name}
                      </p>
                      {mapping.doctor && (
                        <DoctorBadge specialization={mapping.doctor.specialization} />
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.78rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={13} style={{ color: '#94a3b8' }} />
                        {mapping.doctor?.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={13} style={{ color: '#94a3b8' }} />
                        {mapping.doctor?.phone}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-icon"
                    title="Unassign Specialist"
                    style={{ color: '#dc2626' }}
                    onClick={() => handleOpenUnassign(mapping)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Doctor Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Specialist to ${patient.name}`}
      >
        {unassignedDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <UserCheck size={44} style={{ color: '#16a34a', margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: '#0f172a' }}>All Specialists Assigned</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Every active hospital specialist is already assigned to {patient.name}.
            </p>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAssignModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAssignDoctor}>
            <div className="form-group">
              <label className="form-label" htmlFor="doctor-select">
                Select Available Specialist
              </label>
              <select
                id="doctor-select"
                className="form-control"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
              >
                {unassignedDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {formatSpecialization(doc.specialization)}
                  </option>
                ))}
              </select>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Assigning a specialist establishes clinical collaboration and mapping in PostgreSQL.
            </p>

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
                id="confirm-assign-btn"
                type="submit"
                className="btn btn-primary"
                disabled={assignSubmitting}
              >
                {assignSubmitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Unassign Doctor Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isUnassignDialogOpen}
        onClose={() => setIsUnassignDialogOpen(false)}
        onConfirm={handleConfirmUnassign}
        title="Unassign Specialist"
        message={
          mappingToUnassign
            ? `Are you sure you want to remove specialist "${mappingToUnassign.doctor?.name}" from ${patient.name}'s care team?`
            : 'Are you sure you want to unassign this doctor?'
        }
        confirmText="Unassign Specialist"
        loading={unassignSubmitting}
      />

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Patient Profile"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">
              Full Name *
            </label>
            <input
              id="edit-name"
              type="text"
              className="form-control"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-age">
                Age *
              </label>
              <input
                id="edit-age"
                type="number"
                min="0"
                max="150"
                className="form-control"
                value={editFormData.age}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, age: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-gender">
                Gender *
              </label>
              <select
                id="edit-gender"
                className="form-control"
                value={editFormData.gender}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, gender: e.target.value })
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-address">
              Address *
            </label>
            <input
              id="edit-address"
              type="text"
              className="form-control"
              value={editFormData.address}
              onChange={(e) =>
                setEditFormData({ ...editFormData, address: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-medical-details">
              Medical Details & History
            </label>
            <textarea
              id="edit-medical-details"
              className="form-control"
              value={editFormData.medicalDetails}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  medicalDetails: e.target.value,
                })
              }
            ></textarea>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={editSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editSubmitting}
            >
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Patient Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeletePatient}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete "${patient.name}"? This will delete the patient and all associated care team mappings.`}
        confirmText="Confirm Delete"
        loading={deleteSubmitting}
      />
    </div>
  );
};

export default PatientDetail;
