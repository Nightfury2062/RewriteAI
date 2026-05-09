const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const RewriteItem = sequelize.define('RewriteItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  originalText: {
    // TEXT is used instead of STRING to safely handle large paragraphs
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  rewrittenText: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  formality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  length: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  // Enables automatic management of createdAt and updatedAt timestamps
  timestamps: true,
});

module.exports = RewriteItem;
