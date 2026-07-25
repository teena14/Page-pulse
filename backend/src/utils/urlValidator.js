'use strict';

/**
 * Validates a URL string for use in the Page Pulse audit pipeline.
 *
 * @param {*} url - The value to validate.
 * @returns {{ valid: true } | { valid: false, code: string, message: string }}
 */
function validateUrl(url) {
  // Missing: undefined, null, or empty string
  if (url === undefined || url === null || url === '') {
    return {
      valid: false,
      code: 'MISSING_URL',
      message: 'URL is required.',
    };
  }

  // Non-string input (number, object, array, etc.)
  if (typeof url !== 'string') {
    return {
      valid: false,
      code: 'INVALID_URL',
      message: 'The provided URL is not valid.',
    };
  }

  // Parse the URL and validate protocol
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return {
      valid: false,
      code: 'INVALID_URL',
      message: 'The provided URL is not valid.',
    };
  }

  // Only http and https are supported
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      code: 'INVALID_URL',
      message: 'Only http and https URLs are supported.',
    };
  }

  return { valid: true };
}

module.exports = { validateUrl };
