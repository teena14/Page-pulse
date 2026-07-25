'use strict';

const express = require('express');
const request = require('supertest');
const { validateAuditRequest } = require('../../../src/middlewares/validation');

// ─── Minimal Test App ──────────────────────────────────────────────────────────
//
// We mount the middleware on a dedicated test route so Supertest can exercise
// it over real HTTP without starting the full server.

function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.post(
    '/test',
    validateAuditRequest,
    (_req, res) => res.status(200).json({ passed: true })
  );

  // Minimal error handler to surface middleware-thrown errors as JSON
  // (mirrors the pattern used in the real app.js)
  app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({
      success: false,
      error: { code: err.code || 'INTERNAL_SERVER_ERROR', message: err.message },
    });
  });

  return app;
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('validateAuditRequest middleware', () => {
  let app;

  beforeAll(() => {
    app = buildTestApp();
  });

  // ─── Happy Path ──────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('passes a valid https URL body through to the next handler (200)', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: 'https://example.com' });

      expect(res.status).toBe(200);
      expect(res.body.passed).toBe(true);
    });

    test('passes a valid http URL body through to the next handler (200)', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: 'http://example.com' });

      expect(res.status).toBe(200);
      expect(res.body.passed).toBe(true);
    });
  });

  // ─── Boundary Values ─────────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('returns 400 MISSING_URL when url field is an empty string', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_URL');
    });

    test('passes through when body contains extra unexpected fields alongside a valid url', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: 'https://example.com', extra: 'ignored', foo: 123 });

      expect(res.status).toBe(200);
      expect(res.body.passed).toBe(true);
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('returns 400 MISSING_URL when the request body is completely absent', async () => {
      const res = await request(app)
        .post('/test')
        .set('Content-Type', 'application/json')
        .send();

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_URL');
    });

    test('returns 400 MISSING_URL when the url field is absent from the body', async () => {
      const res = await request(app)
        .post('/test')
        .send({ notUrl: 'https://example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_URL');
    });

    test('returns 400 INVALID_URL when url is a number (non-string)', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: 12345 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_URL');
    });

    test('returns 400 INVALID_URL when url is an object (non-string)', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: { href: 'https://example.com' } });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_URL');
    });

    test('returns 400 INVALID_URL when url has an unsupported protocol (ftp://)', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: 'ftp://example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_URL');
    });

    test('returns 400 INVALID_URL for a malformed string with no protocol', async () => {
      const res = await request(app)
        .post('/test')
        .send({ url: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_URL');
    });
  });
});
