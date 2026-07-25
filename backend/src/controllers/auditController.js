'use strict';

const { runAudit } = require('../services/auditService');

/**
 * POST /api/v1/audit
 *
 * Receives a pre-validated URL from the validation middleware (req.validatedUrl),
 * delegates to the Audit Service, and returns a structured JSON report.
 *
 * All errors from the service propagate to the global error handler via next(err).
 *
 * @type {import('express').RequestHandler}
 */
async function audit(req, res, next) {
  try {
    const report = await runAudit(req.validatedUrl);

    return res.status(200).json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { audit };
