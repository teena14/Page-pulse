'use strict';

const axios = require('axios');

/** Base URL of the Page Pulse backend API. */
const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.VITE_API_BASE_URL) ||
  'http://localhost:5000';

/**
 * Creates and throws a normalised error from a failed API call.
 *
 * @param {string} code    - Machine-readable error code.
 * @param {string} message - Human-readable message.
 */
function createClientError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

/**
 * Calls POST /api/v1/audit and returns the full parsed response body.
 *
 * Normalises all error types into structured objects with a `code` property
 * so UI components can react programmatically without string-matching messages.
 *
 * @param {string} url - The webpage URL to audit.
 * @returns {Promise<{ success: boolean, data: object, timestamp: string }>}
 * @throws {Error} With a `code` property matching the API contract error codes.
 */
async function auditUrl(url) {
  let response;

  try {
    response = await axios.post(`${API_BASE_URL}/api/v1/audit`, { url });
  } catch (err) {
    // Axios error with a backend response attached (4xx / 5xx)
    if (err.response?.data?.error) {
      const { code, message } = err.response.data.error;
      throw createClientError(code, message);
    }

    // Network error — backend completely unreachable
    throw createClientError('UPSTREAM_ERROR', 'Unable to reach the Page Pulse server.');
  }

  const body = response?.data;

  // Guard: response body must follow the expected { success, data } shape
  if (!body || typeof body.success !== 'boolean' || !body.data) {
    throw createClientError(
      'INTERNAL_SERVER_ERROR',
      'The server returned an unexpected response format.'
    );
  }

  return body;
}

module.exports = { auditUrl };
