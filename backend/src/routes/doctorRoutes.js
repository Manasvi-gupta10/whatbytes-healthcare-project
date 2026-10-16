const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');

// All doctor routes require authentication
router.use(authenticate);

// Validation rules
const doctorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Doctor name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialization must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  validate,
];

const doctorUpdateValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a valid integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Doctor name cannot be empty'),
  body('specialization')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Specialization cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  validate,
];

const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a valid integer'),
  validate,
];

// Routes
router.post('/', doctorValidation, createDoctor);
router.get('/', getAllDoctors);
router.get('/:id', idParamValidation, getDoctorById);
router.put('/:id', doctorUpdateValidation, updateDoctor);
router.delete('/:id', idParamValidation, deleteDoctor);

module.exports = router;
