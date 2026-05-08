require('dotenv').config();
const express = require('express');
const cors = require('cors');

const processRoutes = require('./routes/processRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

// Routes
app.use('/api/process', processRoutes);

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
