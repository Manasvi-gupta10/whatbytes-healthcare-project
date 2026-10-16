const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Authenticate and sync database models
    await sequelize.authenticate();
    console.log('PostgreSQL database connection established successfully.');

    // sync() will create tables if they do not exist
    await sequelize.sync({ alter: false });
    console.log('All Sequelize models synchronized with PostgreSQL schema.');

    app.listen(PORT, () => {
      console.log(`Healthcare Backend Server is active and listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start backend server:', error);
    process.exit(1);
  }
};

startServer();
