const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');

// All patient routes require authentication
router.use(authenticate);

// Validation rules
const patientValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('age')
    .notEmpty()
    .withMessage('Age is required')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be a valid integer between 0 and 150'),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters long'),
  body('medicalDetails')
    .optional({ nullable: true })
    .isString()
    .withMessage('Medical details must be text'),
  validate,
];

const patientUpdateValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a valid integer'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Patient name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be a valid integer between 0 and 150'),
  body('gender')
    .optional()
    .trim()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty'),
  body('medicalDetails')
    .optional({ nullable: true })
    .isString(),
  validate,
];

const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a valid integer'),
  validate,
];

// Routes
router.post('/', patientValidation, createPatient);
router.get('/', getAllPatients);
router.get('/:id', idParamValidation, getPatientById);
router.put('/:id', patientUpdateValidation, updatePatient);
router.delete('/:id', idParamValidation, deletePatient);

module.exports = router;
