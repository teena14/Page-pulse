'use strict';

const { validateUrl } = require('../utils/urlValidator');

/**
 * Creates a structured HTTP error to pass to Express's next(err) handler.
 *
 * @param {number} status  - HTTP status code.
 * @param {string} code    - Machine-readable error code matching the API contract.
 * @param {string} message - Human-readable description.
 * @returns {Error}
 */
function createHttpError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

/**
 * Express middleware that validates the POST /api/v1/audit request body.
 *
 * Validation order (matches API contract Section 7):
 *  1. Body is present.
 *  2. `url` field exists and is not empty.
 *  3. `url` is a string.
 *  4. `url` passes urlValidator (valid format + supported protocol).
 *
 * On success: calls next() and attaches req.validatedUrl for the controller.
 * On failure: calls next(err) with a structured HTTP error.
 *
 * @type {import('express').RequestHandler}
 */
function validateAuditRequest(req, res, next) {
  const { url } = req.body || {};

  const validation = validateUrl(url);

  if (!validation.valid) {
    const status = validation.code === 'MISSING_URL' ? 400 : 400;
    return next(createHttpError(status, validation.code, validation.message));
  }

  // Attach the validated URL for downstream handlers
  req.validatedUrl = url;
  return next();
}

module.exports = { validateAuditRequest };
