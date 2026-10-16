const { PatientDoctorMapping, Patient, Doctor } = require('../models');

// @desc Assign a doctor to a patient
// @route POST /api/mappings/
// @access Private
const assignDoctorToPatient = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.body;

    // 1. Verify patient exists and belongs to the authenticated user
    const patient = await Patient.findOne({
      where: {
        id: patientId,
        userId: req.user.id, // Strict ownership check
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or you are not authorized to assign doctors to this patient.',
      });
    }

    // 2. Verify doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // 3. Prevent duplicate assignments
    const existingMapping = await PatientDoctorMapping.findOne({
      where: {
        patientId,
        doctorId,
      },
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already assigned to this patient.',
      });
    }

    // 4. Create mapping
    const mapping = await PatientDoctorMapping.create({
      patientId,
      doctorId,
    });

    // 5. Fetch with relations for rich frontend response
    const completeMapping = await PatientDoctorMapping.findByPk(mapping.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'age', 'gender'],
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'specialization', 'email', 'phone'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor successfully assigned to patient.',
      data: completeMapping,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Retrieve mappings associated with the authenticated user's patients
// @route GET /api/mappings/
// @access Private
const getAllUserMappings = async (req, res, next) => {
  try {
    // Only retrieve mappings for patients owned by the authenticated user
    const mappings = await PatientDoctorMapping.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          where: { userId: req.user.id }, // Strict user patient filter
          attributes: ['id', 'name', 'age', 'gender', 'medicalDetails'],
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'specialization', 'email', 'phone'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Retrieve all doctors assigned to a specific patient
// @route GET /api/mappings/:patientId/
// @access Private
const getDoctorsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Verify patient belongs to user
    const patient = await Patient.findOne({
      where: {
        id: patientId,
        userId: req.user.id,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or you are not authorized to view mappings for this patient.',
      });
    }

    const mappings = await PatientDoctorMapping.findAll({
      where: { patientId },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'specialization', 'email', 'phone'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: mappings.length,
      patient: {
        id: patient.id,
        name: patient.name,
      },
      data: mappings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Remove a patient-doctor assignment
// @route DELETE /api/mappings/:id/
// @access Private
const deleteMapping = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the mapping and join patient to check user ownership
    const mapping = await PatientDoctorMapping.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'userId'],
        },
      ],
    });

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: 'Assignment mapping not found.',
      });
    }

    // Ownership check: mapping's patient must belong to the current authenticated user
    if (!mapping.patient || mapping.patient.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove this assignment.',
      });
    }

    await mapping.destroy();

    return res.status(200).json({
      success: true,
      message: 'Patient-doctor assignment removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignDoctorToPatient,
  getAllUserMappings,
  getDoctorsByPatient,
  deleteMapping,
};
