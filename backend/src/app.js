const express = require('express');
const auditRoutes = require('./routes/audit');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/v1', auditRoutes);

app.use(errorHandler);

module.exports = app;
