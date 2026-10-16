const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PatientDoctorMapping = sequelize.define('PatientDoctorMapping', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  tableName: 'patient_doctor_mappings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['patientId', 'doctorId'],
      name: 'unique_patient_doctor_mapping',
    },
  ],
});

module.exports = PatientDoctorMapping;
