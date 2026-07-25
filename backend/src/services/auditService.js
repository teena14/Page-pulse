'use strict';

const axios = require('axios');
const { parseHtml } = require('./htmlParserService');

/** Request timeout in milliseconds (10 seconds per API contract). */
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Creates a structured service error with a machine-readable code.
 *
 * @param {string} code    - Machine-readable error code (matches API contract).
 * @param {string} message - Human-readable description.
 * @returns {Error}
 */
function createServiceError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

/**
 * Fetches a webpage and compiles a full audit report.
 *
 * @param {string} url - A validated, absolute URL to audit.
 * @returns {Promise<{
 *   url: string,
 *   httpStatus: number,
 *   responseTime: number,
 *   title: string,
 *   metaDescription: string,
 *   h1Count: number,
 *   imagesMissingAlt: number,
 *   wordCount: number
 * }>}
 * @throws {Error} With a `code` property matching the API contract error codes.
 */
async function runAudit(url) {
  const startTime = Date.now();
  let response;

  try {
    response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      // Allow Axios to follow redirects automatically (default behavior).
      maxRedirects: 10,
      // Prevent Axios from throwing on non-2xx HTTP statuses from the target;
      // we still want to return the report with the real httpStatus embedded.
      validateStatus: () => true,
    });
  } catch (err) {
    // Axios timeout
    if (err.code === 'ECONNABORTED') {
      throw createServiceError('REQUEST_TIMEOUT', 'The target website took too long to respond.');
    }
    // DNS failure, connection refused, network unreachable, etc.
    throw createServiceError('UPSTREAM_ERROR', 'Unable to reach the target website.');
  }

  const responseTime = Date.now() - startTime;

  // Verify the response body is HTML before parsing
  const contentType = response.headers?.['content-type'] || '';
  if (!contentType.includes('text/html')) {
    throw createServiceError(
      'NON_HTML_RESPONSE',
      'Target URL did not return an HTML document.'
    );
  }

  const parsed = parseHtml(response.data);

  return {
    url,
    httpStatus: response.status,
    responseTime,
    ...parsed,
  };
}

module.exports = { runAudit };
