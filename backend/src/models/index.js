const { sequelize } = require('../config/db');
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const PatientDoctorMapping = require('./PatientDoctorMapping');

// User <-> Patient (One to Many)
User.hasMany(Patient, {
  foreignKey: 'userId',
  as: 'patients',
  onDelete: 'CASCADE',
});
Patient.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Patient <-> PatientDoctorMapping (One to Many)
Patient.hasMany(PatientDoctorMapping, {
  foreignKey: 'patientId',
  as: 'mappings',
  onDelete: 'CASCADE',
});
PatientDoctorMapping.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});

// Doctor <-> PatientDoctorMapping (One to Many)
Doctor.hasMany(PatientDoctorMapping, {
  foreignKey: 'doctorId',
  as: 'mappings',
  onDelete: 'CASCADE',
});
PatientDoctorMapping.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor',
});

// Patient <-> Doctor (Many to Many through PatientDoctorMapping)
Patient.belongsToMany(Doctor, {
  through: PatientDoctorMapping,
  foreignKey: 'patientId',
  otherKey: 'doctorId',
  as: 'doctors',
});
Doctor.belongsToMany(Patient, {
  through: PatientDoctorMapping,
  foreignKey: 'doctorId',
  otherKey: 'patientId',
  as: 'patients',
});

module.exports = {
  sequelize,
  User,
  Patient,
  Doctor,
  PatientDoctorMapping,
};
