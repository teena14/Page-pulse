'use strict';

/**
 * Global Express error handling middleware.
 *
 * Must be registered LAST in app.js (after all routes) with exactly
 * four parameters so Express recognises it as an error handler.
 *
 * Responsibilities:
 *  - Normalise any thrown value (Error object, plain string, object) into a
 *    safe, structured JSON response.
 *  - Map known service errors (with err.code / err.status) to their correct
 *    HTTP status codes.
 *  - Default to 500 INTERNAL_SERVER_ERROR for anything unrecognised.
 *  - NEVER expose stack traces or internal details in the response body.
 *
 * @type {import('express').ErrorRequestHandler}
 */
function errorHandler(err, _req, res, _next) {
  // ── Normalise the thrown value ────────────────────────────────────────────
  // `err` might not be an Error object if someone called next('string') or
  // next({ weird: true }). Normalise to a consistent shape before proceeding.

  const isErrorObject = err instanceof Error;

  const status =
    isErrorObject && typeof err.status === 'number' ? err.status : 500;

  const code =
    isErrorObject && typeof err.code === 'string'
      ? err.code
      : 'INTERNAL_SERVER_ERROR';

  const rawMessage = isErrorObject
    ? err.message
    : typeof err === 'string'
    ? err
    : 'An unexpected error occurred.';

  // Use a fallback if message is empty/blank
  const message =
    typeof rawMessage === 'string' && rawMessage.trim().length > 0
      ? rawMessage.trim()
      : 'An unexpected error occurred.';

  // ── Send consistent JSON response ─────────────────────────────────────────
  // Stack traces and internal Node details are intentionally excluded.

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

module.exports = { errorHandler };
