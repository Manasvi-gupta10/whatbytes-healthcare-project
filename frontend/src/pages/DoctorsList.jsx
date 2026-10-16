import React, { useState, useEffect } from 'react';
import { doctorService } from '../services/doctorService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import DoctorBadge, { formatSpecialization } from '../components/DoctorBadge';
import {
  Stethoscope,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Users,
} from 'lucide-react';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [alert, setAlert] = useState({ type: 'success', message: '' });

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
  });

  // Delete Modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getAllDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
      setAlert({
        type: 'error',
        message: 'Unable to load doctor directory.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: '',
      email: '',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      specialization: doc.specialization,
      email: doc.email,
      phone: doc.phone,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.specialization.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      setAlert({ type: 'error', message: 'All fields are required.' });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setAlert({ type: 'error', message: 'Doctor phone number must be exactly 10 digits.' });
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        specialization: formatSpecialization(formData.specialization),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };
      if (editingDoctor) {
        await doctorService.updateDoctor(editingDoctor.id, payload);
        setAlert({
          type: 'success',
          message: `Doctor ${payload.name} updated successfully.`,
        });
      } else {
        await doctorService.createDoctor(payload);
        setAlert({
          type: 'success',
          message: `Doctor ${payload.name} added successfully.`,
        });
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to save doctor record.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = (doc) => {
    setDoctorToDelete(doc);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      setDeleteSubmitting(true);
      await doctorService.deleteDoctor(doctorToDelete.id);
      setAlert({
        type: 'success',
        message: `Doctor ${doctorToDelete.name} deleted successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to delete doctor record.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Build unique specializations list case-insensitively
  const uniqueSpecMap = new Map();
  doctors.forEach((doc) => {
    if (doc.specialization) {
      const key = doc.specialization.trim().toLowerCase();
      if (!uniqueSpecMap.has(key)) {
        uniqueSpecMap.set(key, formatSpecialization(doc.specialization));
      }
    }
  });

  const specializations = [
    'All',
    ...Array.from(uniqueSpecMap.values()).sort(),
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchTerm.trim().toLowerCase();
    const docSpec = formatSpecialization(doc.specialization);
    const matchesSearch =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      docSpec.toLowerCase().includes(q) ||
      doc.email.toLowerCase().includes(q);
    const matchesSpec =
      specializationFilter === 'All' ||
      docSpec.toLowerCase() === specializationFilter.trim().toLowerCase();
    return matchesSearch && matchesSpec;
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
            Doctor Directory
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Available medical specialists and clinical practitioners.
          </p>
        </div>

        <button
          id="add-doctor-btn"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <Plus size={17} />
          <span>Add New Doctor</span>
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
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1rem',
          background: '#ffffff',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
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
            id="search-doctors-input"
            type="text"
            className="form-control"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-control"
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec === 'All' ? 'All Specializations' : spec}
              </option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
        </span>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div className="spinner spinner-lg"></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>
            Loading doctor profiles...
          </p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="glass-card empty-state" style={{ background: '#ffffff' }}>
          <Stethoscope size={48} className="empty-state-icon" />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem', color: '#0f172a' }}>
            No doctors found
          </h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', color: '#64748b' }}>
            No doctor records matched your filter criteria.
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0284c7',
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                        {doc.name}
                      </h3>
                      <DoctorBadge specialization={doc.specialization} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      title="Edit Doctor"
                      onClick={() => handleOpenEdit(doc)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon"
                      title="Delete Doctor"
                      style={{ color: '#dc2626' }}
                      onClick={() => handleOpenDelete(doc)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                    <Mail size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.email}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                    <Phone size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span>{doc.phone}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#64748b',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} style={{ color: '#94a3b8' }} />
                  <span>
                    {doc.patients ? doc.patients.length : 0}{' '}
                    {doc.patients && doc.patients.length === 1 ? 'Patient' : 'Patients'} Assigned
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor Record' : 'Add New Hospital Doctor'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="doctor-name">
              Doctor Full Name *
            </label>
            <input
              id="doctor-name"
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Robert House"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="doctor-specialization">
              Specialization *
            </label>
            <input
              id="doctor-specialization"
              type="text"
              className="form-control"
              placeholder="e.g. Cardiology, Pediatrics, Neurology..."
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="doctor-email">
              Email Address *
            </label>
            <input
              id="doctor-email"
              type="email"
              className="form-control"
              placeholder="e.g. robert.house@hospital.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="doctor-phone">
              Phone Number (10 Digits) *
            </label>
            <input
              id="doctor-phone"
              type="tel"
              maxLength="10"
              pattern="[0-9]{10}"
              className="form-control"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: val });
              }}
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={formSubmitting}
            >
              Cancel
            </button>
            <button
              id="submit-doctor-form-btn"
              type="submit"
              className="btn btn-primary"
              disabled={formSubmitting}
            >
              {formSubmitting ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : editingDoctor ? (
                'Save Changes'
              ) : (
                'Add Doctor'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Doctor Record"
        message={
          doctorToDelete
            ? `Are you sure you want to delete "${doctorToDelete.name}"? Any active patient assignments with this doctor will also be removed.`
            : 'Are you sure you want to delete this doctor?'
        }
        confirmText="Confirm Delete"
        loading={deleteSubmitting}
      />
    </div>
  );
};

export default DoctorsList;
