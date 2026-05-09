const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize to use SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  // Store the database file in the root of the backend directory
  storage: path.join(__dirname, '../../rewriteai.db'),
  // Disable logging to keep the console clean in production
  // Change to console.log if you need to debug SQL queries
  logging: false, 
});

module.exports = sequelize;
