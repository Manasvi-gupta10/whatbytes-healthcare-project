const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'healthcare_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? false : false, // Clean console logs
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
