const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  assignDoctorToPatient,
  getAllUserMappings,
  getDoctorsByPatient,
  deleteMapping,
} = require('../controllers/mappingController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');

// All mapping routes require authentication
router.use(authenticate);

// Validation rules
const assignValidation = [
  body('patientId')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a valid integer'),
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isInt({ min: 1 })
    .withMessage('Doctor ID must be a valid integer'),
  validate,
];

const patientIdParamValidation = [
  param('patientId')
    .isInt({ min: 1 })
    .withMessage('Patient ID must be a valid integer'),
  validate,
];

const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Mapping ID must be a valid integer'),
  validate,
];

// Routes
router.post('/', assignValidation, assignDoctorToPatient);
router.get('/', getAllUserMappings);
router.get('/:patientId', patientIdParamValidation, getDoctorsByPatient);
router.delete('/:id', idParamValidation, deleteMapping);

module.exports = router;
