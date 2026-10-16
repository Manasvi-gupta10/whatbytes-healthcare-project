import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../services/patientService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import DoctorBadge from '../components/DoctorBadge';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  MapPin,
} from 'lucide-react';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ type: 'success', message: '' });

  // Modal State for Add / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    address: '',
    medicalDetails: '',
  });

  // Modal State for Delete
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAllPatients();
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Unable to load patients. Please refresh the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      address: '',
      medicalDetails: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      medicalDetails: patient.medicalDetails || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.age || !formData.address.trim()) {
      setAlert({
        type: 'error',
        message: 'Name, age, gender, and address are required.',
      });
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingPatient) {
        await patientService.updatePatient(editingPatient.id, formData);
        setAlert({
          type: 'success',
          message: `Patient ${formData.name} updated successfully.`,
        });
      } else {
        await patientService.createPatient(formData);
        setAlert({
          type: 'success',
          message: `Patient ${formData.name} created successfully.`,
        });
      }
      setIsFormModalOpen(false);
      fetchPatients();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to save patient record.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      setDeleteSubmitting(true);
      await patientService.deletePatient(patientToDelete.id);
      setAlert({
        type: 'success',
        message: `Patient ${patientToDelete.name} deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to delete patient record.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      (p.medicalDetails && p.medicalDetails.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-wrapper">
      {/* Page Header */}
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
            Patient Records
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Clinical history, medical details, and practitioner assignments.
          </p>
        </div>

        <button
          id="add-patient-btn"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={17} />
          <span>Add New Patient</span>
        </button>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, message: '' })}
        />
      )}

      {/* Filter and Search Bar */}
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
            id="search-patients-input"
            type="text"
            className="form-control"
            placeholder="Search patients by name, address, or medical details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
        </span>
      </div>

      {/* Table Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div className="spinner spinner-lg"></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>
            Retrieving clinical patient records...
          </p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="glass-card empty-state" style={{ background: '#ffffff' }}>
          <Users size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#0f172a' }}>
            {searchTerm ? 'No matching patients found' : 'No patients recorded yet'}
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: '#64748b' }}>
            {searchTerm
              ? 'Try modifying your search criteria.'
              : 'Add patient profiles to track medical records and care team doctors.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Add First Patient
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Age / Gender</th>
                <th>Address</th>
                <th>Assigned Doctors</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <Link
                      to={`/patients/${patient.id}`}
                      style={{
                        fontWeight: 700,
                        color: '#0284c7',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        display: 'block',
                      }}
                    >
                      {patient.name}
                    </Link>
                    {patient.medicalDetails && (
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          maxWidth: '280px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '0.15rem',
                        }}
                      >
                        {patient.medicalDetails}
                      </p>
                    )}
                  </td>
                  <td style={{ color: '#334155' }}>
                    <span style={{ fontWeight: 600 }}>{patient.age}</span> yrs • {patient.gender}
                  </td>
                  <td style={{ color: '#475569', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span
                        style={{
                          maxWidth: '200px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {patient.address}
                      </span>
                    </div>
                  </td>
                  <td>
                    {patient.doctors && patient.doctors.length > 0 ? (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {patient.doctors.map((d) => (
                          <DoctorBadge key={d.id} specialization={d.specialization} />
                        ))}
                      </div>
                    ) : (
                      <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Link
                        to={`/patients/${patient.id}`}
                        className="btn btn-secondary btn-icon"
                        title="View Full Clinical Profile"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        className="btn btn-secondary btn-icon"
                        title="Edit Patient"
                        onClick={() => handleOpenEdit(patient)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-secondary btn-icon"
                        title="Delete Patient"
                        style={{ color: '#dc2626' }}
                        onClick={() => handleOpenDelete(patient)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingPatient ? 'Edit Patient Record' : 'Register New Patient'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="patient-name">
              Patient Full Name *
            </label>
            <input
              id="patient-name"
              type="text"
              className="form-control"
              placeholder="e.g. Johnathan Miller"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="patient-age">
                Age *
              </label>
              <input
                id="patient-age"
                type="number"
                min="0"
                max="150"
                className="form-control"
                placeholder="45"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="patient-gender">
                Gender *
              </label>
              <select
                id="patient-gender"
                className="form-control"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patient-address">
              Address *
            </label>
            <input
              id="patient-address"
              type="text"
              className="form-control"
              placeholder="e.g. 124 Medical Center Way, Suite 4B"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patient-medical-details">
              Medical Details & Clinical History (Optional)
            </label>
            <textarea
              id="patient-medical-details"
              className="form-control"
              placeholder="Allergies, pre-existing conditions, active medications, diagnoses..."
              value={formData.medicalDetails}
              onChange={(e) => setFormData({ ...formData, medicalDetails: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              id="submit-patient-form-btn"
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : editingPatient ? (
                'Save Changes'
              ) : (
                'Create Patient Record'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Patient Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Patient Record"
        message={
          patientToDelete
            ? `Are you sure you want to delete patient "${patientToDelete.name}"? All assigned care team mappings for this patient will also be removed.`
            : 'Are you sure you want to delete this patient?'
        }
        confirmText="Confirm Delete"
        loading={deleteSubmitting}
      />
    </div>
  );
};

export default PatientsList;
