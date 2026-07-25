const express = require('express');
const cors = require('cors');
const auditRoutes = require('./routes/audit');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', auditRoutes);

app.use(errorHandler);

module.exports = app;
