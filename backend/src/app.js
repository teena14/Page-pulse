const express = require('express');
const path = require('path');
const auditRoutes = require('./routes/audit');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

// API routes
app.use('/api/v1', auditRoutes);

// Serve the static frontend build
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback for React Router (if added in the future) or just serving the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
