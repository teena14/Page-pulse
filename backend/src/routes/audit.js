'use strict';

const { Router } = require('express');
const { validateAuditRequest } = require('../middlewares/validation');
const { audit } = require('../controllers/auditController');

const router = Router();

/**
 * POST /api/v1/audit
 *
 * Validation middleware runs first and attaches req.validatedUrl on success.
 * The controller is only reached if validation passes.
 */
router.post('/audit', validateAuditRequest, audit);

module.exports = router;
