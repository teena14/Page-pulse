const express = require('express');

const auditRoutes = require('./routes/audit');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

// API routes
app.use('/api/v1', auditRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
