const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Doctor name is required' },
    },
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val) {
      if (typeof val === 'string') {
        const formatted = val
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());
        this.setDataValue('specialization', formatted);
      } else {
        this.setDataValue('specialization', val);
      }
    },
    validate: {
      notEmpty: { msg: 'Specialization is required' },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'doctors_email_unique',
      msg: 'Doctor with this email already exists',
    },
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
      notEmpty: { msg: 'Email is required' },
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' },
    },
  },
}, {
  tableName: 'doctors',
  timestamps: true,
});

module.exports = Doctor;
