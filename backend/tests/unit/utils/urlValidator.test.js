'use strict';

const { validateUrl } = require('../../../src/utils/urlValidator');

describe('validateUrl', () => {
  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('accepts a standard https URL', () => {
      const result = validateUrl('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('accepts a standard http URL', () => {
      const result = validateUrl('http://example.com');
      expect(result.valid).toBe(true);
    });
  });

  // ─── Boundary Values ───────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('accepts a URL with a trailing slash', () => {
      const result = validateUrl('https://example.com/');
      expect(result.valid).toBe(true);
    });

    test('accepts a URL with query parameters', () => {
      const result = validateUrl('https://example.com/search?q=hello&page=2');
      expect(result.valid).toBe(true);
    });

    test('accepts a very long but valid URL', () => {
      const longPath = 'a'.repeat(1000);
      const result = validateUrl(`https://example.com/${longPath}`);
      expect(result.valid).toBe(true);
    });
  });

  // ─── Failure Modes ─────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('rejects when url is missing (undefined)', () => {
      const result = validateUrl(undefined);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('MISSING_URL');
    });

    test('rejects when url is an empty string', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('MISSING_URL');
    });

    test('rejects when url is null', () => {
      const result = validateUrl(null);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('MISSING_URL');
    });

    test('rejects when url is a number (non-string input)', () => {
      const result = validateUrl(12345);
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_URL');
    });

    test('rejects when url is an object (non-string input)', () => {
      const result = validateUrl({ url: 'https://example.com' });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_URL');
    });

    test('rejects an ftp:// URL (unsupported protocol)', () => {
      const result = validateUrl('ftp://example.com');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_URL');
    });

    test('rejects a malformed string with no protocol', () => {
      const result = validateUrl('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.code).toBe('INVALID_URL');
    });
  });
});
