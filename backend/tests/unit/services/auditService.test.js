'use strict';

// Mock axios BEFORE requiring auditService so Jest intercepts all calls
jest.mock('axios');
const axios = require('axios');
const { runAudit } = require('../../../src/services/auditService');
const mocks = require('../../fixtures/mockResponses/axiosResponses');

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Asserts the full shape of a successful audit report. */
function expectValidReport(result) {
  expect(result).toHaveProperty('url');
  expect(result).toHaveProperty('httpStatus');
  expect(result).toHaveProperty('responseTime');
  expect(result).toHaveProperty('title');
  expect(result).toHaveProperty('metaDescription');
  expect(result).toHaveProperty('h1Count');
  expect(result).toHaveProperty('imagesMissingAlt');
  expect(result).toHaveProperty('wordCount');
  expect(typeof result.responseTime).toBe('number');
  expect(result.responseTime).toBeGreaterThanOrEqual(0);
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('runAudit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('returns a complete structured report for a valid HTML page', async () => {
      axios.get.mockResolvedValue(mocks.successHtmlResponse);

      const result = await runAudit('https://example.com');

      expectValidReport(result);
      expect(result.url).toBe('https://example.com');
      expect(result.httpStatus).toBe(200);
      expect(result.title).toBe('Example Domain');
      expect(result.metaDescription).toBe('This is a full example page for testing.');
      expect(result.h1Count).toBe(1);
      expect(result.imagesMissingAlt).toBe(2);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    test('calls axios.get with the correct URL and timeout config', async () => {
      axios.get.mockResolvedValue(mocks.successHtmlResponse);

      await runAudit('https://example.com');

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ timeout: expect.any(Number) })
      );
    });

    test('responseTime is a non-negative number in milliseconds', async () => {
      axios.get.mockResolvedValue(mocks.successHtmlResponse);

      const result = await runAudit('https://example.com');

      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(result.responseTime)).toBe(true);
    });
  });

  // ─── Boundary Values ───────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('resolves redirect chain and returns report for the final page', async () => {
      axios.get.mockResolvedValue(mocks.redirectResolvedResponse);

      const result = await runAudit('http://example.com');

      expectValidReport(result);
      expect(result.httpStatus).toBe(200);
      expect(result.title).toBe('Redirected Page');
      expect(result.h1Count).toBe(1);
    });

    test('responseTime is measured even when response arrives near the timeout boundary', async () => {
      // Simulate a slow but successful response (~9.9s)
      axios.get.mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mocks.successHtmlResponse), 50) // use 50ms in tests
        )
      );

      const result = await runAudit('https://slow-site.com');

      expectValidReport(result);
      expect(result.responseTime).toBeGreaterThanOrEqual(50);
    });
  });

  // ─── Failure Modes ─────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('throws UPSTREAM_ERROR on DNS/network failure (ENOTFOUND)', async () => {
      axios.get.mockRejectedValue(mocks.dnsError);

      await expect(runAudit('https://this-does-not-exist.com')).rejects.toMatchObject({
        code: 'UPSTREAM_ERROR',
      });
    });

    test('throws REQUEST_TIMEOUT on axios timeout (ECONNABORTED)', async () => {
      axios.get.mockRejectedValue(mocks.timeoutError);

      await expect(runAudit('https://slow.com')).rejects.toMatchObject({
        code: 'REQUEST_TIMEOUT',
      });
    });

    test('throws NON_HTML_RESPONSE when target returns a PDF', async () => {
      axios.get.mockResolvedValue(mocks.pdfResponse);

      await expect(runAudit('https://example.com/doc.pdf')).rejects.toMatchObject({
        code: 'NON_HTML_RESPONSE',
      });
    });

    test('throws NON_HTML_RESPONSE when target returns an image', async () => {
      axios.get.mockResolvedValue(mocks.imageResponse);

      await expect(runAudit('https://example.com/photo.png')).rejects.toMatchObject({
        code: 'NON_HTML_RESPONSE',
      });
    });

    test('throws NON_HTML_RESPONSE when target returns a ZIP file', async () => {
      axios.get.mockResolvedValue(mocks.zipResponse);

      await expect(runAudit('https://example.com/archive.zip')).rejects.toMatchObject({
        code: 'NON_HTML_RESPONSE',
      });
    });
  });
});
