'use strict';

// Mock the audit service BEFORE any module that requires it is loaded
jest.mock('../../../src/services/auditService');
const { runAudit } = require('../../../src/services/auditService');

const express = require('express');
const request = require('supertest');
const auditRouter = require('../../../src/routes/audit');
const { errorHandler } = require('../../../src/middlewares/errorHandler');

// ─── Minimal Test App ──────────────────────────────────────────────────────────
//
// Mirrors the real app.js setup: body parser → route → global error handler.

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', auditRouter);
  app.use(errorHandler);
  return app;
}

// ─── Shared report fixture ─────────────────────────────────────────────────────

const fullReport = {
  url: 'https://example.com',
  httpStatus: 200,
  responseTime: 243,
  title: 'Example Domain',
  metaDescription: 'This is a full example page for testing.',
  h1Count: 1,
  imagesMissingAlt: 2,
  wordCount: 116,
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/v1/audit', () => {
  let app;

  beforeAll(() => {
    app = buildTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy Path ──────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('returns 200 with correctly shaped JSON report for a valid URL', async () => {
      runAudit.mockResolvedValue(fullReport);

      const res = await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject(fullReport);
      expect(typeof res.body.timestamp).toBe('string');
    });

    test('response data contains all required API contract fields', async () => {
      runAudit.mockResolvedValue(fullReport);

      const res = await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://example.com' });

      const requiredFields = [
        'url', 'httpStatus', 'responseTime',
        'title', 'metaDescription', 'h1Count',
        'imagesMissingAlt', 'wordCount',
      ];
      requiredFields.forEach((field) => expect(res.body.data).toHaveProperty(field));
    });

    test('calls runAudit with the validated URL string', async () => {
      runAudit.mockResolvedValue(fullReport);

      await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://example.com' });

      expect(runAudit).toHaveBeenCalledTimes(1);
      expect(runAudit).toHaveBeenCalledWith('https://example.com');
    });
  });

  // ─── Boundary Values ─────────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('returns 200 when service returns minimal/empty string fields', async () => {
      const minimalReport = {
        url: 'https://example.com',
        httpStatus: 200,
        responseTime: 10,
        title: '',
        metaDescription: '',
        h1Count: 0,
        imagesMissingAlt: 0,
        wordCount: 0,
      };
      runAudit.mockResolvedValue(minimalReport);

      const res = await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('');
      expect(res.body.data.h1Count).toBe(0);
      expect(res.body.data.wordCount).toBe(0);
    });

    test('timestamp is a valid ISO 8601 string', async () => {
      runAudit.mockResolvedValue(fullReport);

      const res = await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://example.com' });

      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('returns 408 REQUEST_TIMEOUT when service throws a timeout error', async () => {
      const err = new Error('The target website took too long to respond.');
      err.code = 'REQUEST_TIMEOUT';
      err.status = 408;
      runAudit.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://slow.com' });

      expect(res.status).toBe(408);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REQUEST_TIMEOUT');
    });

    test('returns 502 UPSTREAM_ERROR when service throws an unreachable host error', async () => {
      const err = new Error('Unable to reach the target website.');
      err.code = 'UPSTREAM_ERROR';
      err.status = 502;
      runAudit.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://nonexistent.com' });

      expect(res.status).toBe(502);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UPSTREAM_ERROR');
    });

    test('returns 422 NON_HTML_RESPONSE when service throws a non-HTML error', async () => {
      const err = new Error('Target URL did not return an HTML document.');
      err.code = 'NON_HTML_RESPONSE';
      err.status = 422;
      runAudit.mockRejectedValue(err);

      const res = await request(app)
        .post('/api/v1/audit')
        .send({ url: 'https://example.com/file.pdf' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NON_HTML_RESPONSE');
    });
  });
});
