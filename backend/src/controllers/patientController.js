const { Patient, Doctor, PatientDoctorMapping } = require('../models');

// @desc Create a new patient
// @route POST /api/patients/
// @access Private
const createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, address, medicalDetails } = req.body;

    const patient = await Patient.create({
      name: name.trim(),
      age: parseInt(age, 10),
      gender: gender.trim(),
      address: address.trim(),
      medicalDetails: medicalDetails ? medicalDetails.trim() : null,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Patient created successfully.',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Retrieve all patients created by authenticated user
// @route GET /api/patients/
// @access Private
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Doctor,
          as: 'doctors',
          through: { attributes: ['id', 'createdAt'] },
          attributes: ['id', 'name', 'specialization', 'email', 'phone'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Retrieve a specific patient belonging to authenticated user
// @route GET /api/patients/:id/
// @access Private
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({
      where: {
        id,
        userId: req.user.id, // Strict ownership check
      },
      include: [
        {
          model: Doctor,
          as: 'doctors',
          through: { attributes: ['id', 'createdAt'] },
          attributes: ['id', 'name', 'specialization', 'email', 'phone'],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or you are not authorized to view this record.',
      });
    }

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update an existing patient
// @route PUT /api/patients/:id/
// @access Private
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, age, gender, address, medicalDetails } = req.body;

    const patient = await Patient.findOne({
      where: {
        id,
        userId: req.user.id, // Strict ownership check
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or you are not authorized to update this record.',
      });
    }

    // Update patient attributes
    if (name !== undefined) patient.name = name.trim();
    if (age !== undefined) patient.age = parseInt(age, 10);
    if (gender !== undefined) patient.gender = gender.trim();
    if (address !== undefined) patient.address = address.trim();
    if (medicalDetails !== undefined) patient.medicalDetails = medicalDetails ? medicalDetails.trim() : null;

    await patient.save();

    return res.status(200).json({
      success: true,
      message: 'Patient updated successfully.',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a patient
// @route DELETE /api/patients/:id/
// @access Private
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({
      where: {
        id,
        userId: req.user.id, // Strict ownership check
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or you are not authorized to delete this record.',
      });
    }

    // Cascades delete patient mappings and removes patient
    await patient.destroy();

    return res.status(200).json({
      success: true,
      message: 'Patient deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
