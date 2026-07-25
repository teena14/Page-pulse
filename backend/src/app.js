const express = require('express');
const cors = require('cors');
const auditRoutes = require('./routes/audit');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
}));
app.use(express.json());

app.use('/api/v1', auditRoutes);

app.use(errorHandler);

module.exports = app;
