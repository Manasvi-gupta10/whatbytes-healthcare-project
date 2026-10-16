const { Doctor, Patient } = require('../models');

// Helper to format specialization into consistent Title Case
const formatSpecialization = (str) => {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// @desc Create a doctor record
// @route POST /api/doctors/
// @access Private
const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, email, phone } = req.body;

    const existingDoctor = await Doctor.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'A doctor with this email already exists.',
      });
    }

    const doctor = await Doctor.create({
      name: name.trim(),
      specialization: formatSpecialization(specialization),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor created successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Retrieve all available doctor records
// @route GET /api/doctors/
// @access Private
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      order: [['name', 'ASC']],
      include: [
        {
          model: Patient,
          as: 'patients',
          through: { attributes: ['id', 'createdAt'] },
          attributes: ['id', 'name', 'age', 'gender'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Retrieve a specific doctor
// @route GET /api/doctors/:id/
// @access Private
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patients',
          through: { attributes: ['id', 'createdAt'] },
          attributes: ['id', 'name', 'age', 'gender', 'medicalDetails'],
        },
      ],
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update a doctor record
// @route PUT /api/doctors/:id/
// @access Private
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, specialization, email, phone } = req.body;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    if (email && email.toLowerCase().trim() !== doctor.email) {
      const emailExists = await Doctor.findOne({
        where: { email: email.toLowerCase().trim() },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Another doctor already has this email address.',
        });
      }
      doctor.email = email.toLowerCase().trim();
    }

    if (name !== undefined) doctor.name = name.trim();
    if (specialization !== undefined) doctor.specialization = formatSpecialization(specialization);
    if (phone !== undefined) doctor.phone = phone.trim();

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: 'Doctor updated successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a doctor record
// @route DELETE /api/doctors/:id/
// @access Private
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    await doctor.destroy();

    return res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
