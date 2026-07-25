'use strict';

const express = require('express');
const request = require('supertest');
const { errorHandler } = require('../../../src/middlewares/errorHandler');

// ─── Minimal Test App Factory ──────────────────────────────────────────────────
//
// Each test route throws a specific error type. The global error handler
// is mounted at the end, exactly as it would be in app.js.

function buildTestApp(routeHandler) {
  const app = express();
  app.use(express.json());

  // Route that triggers the error under test
  app.get('/test', routeHandler);

  // The global error handler under test
  app.use(errorHandler);

  return app;
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('errorHandler middleware', () => {
  // ─── Happy Path ──────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('maps a known error with code + status to the correct HTTP status and JSON body', async () => {
      const app = buildTestApp((_req, _res, next) => {
        const err = new Error('The provided URL is not valid.');
        err.status = 400;
        err.code = 'INVALID_URL';
        next(err);
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_URL');
      expect(res.body.error.message).toBe('The provided URL is not valid.');
    });

    test('maps a 408 REQUEST_TIMEOUT error correctly', async () => {
      const app = buildTestApp((_req, _res, next) => {
        const err = new Error('The target website took too long to respond.');
        err.status = 408;
        err.code = 'REQUEST_TIMEOUT';
        next(err);
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(408);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REQUEST_TIMEOUT');
    });

    test('maps a 502 UPSTREAM_ERROR correctly', async () => {
      const app = buildTestApp((_req, _res, next) => {
        const err = new Error('Unable to reach the target website.');
        err.status = 502;
        err.code = 'UPSTREAM_ERROR';
        next(err);
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(502);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UPSTREAM_ERROR');
    });
  });

  // ─── Boundary Values ─────────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('handles an error with no message gracefully (uses fallback message)', async () => {
      const app = buildTestApp((_req, _res, next) => {
        const err = new Error();
        err.status = 400;
        err.code = 'INVALID_URL';
        next(err);
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(typeof res.body.error.message).toBe('string');
      expect(res.body.error.message.length).toBeGreaterThan(0);
    });

    test('handles errors thrown inside async route handlers', async () => {
      const app = buildTestApp(async (_req, _res, next) => {
        try {
          await Promise.reject(new Error('async failure'));
        } catch (err) {
          err.status = 422;
          err.code = 'NON_HTML_RESPONSE';
          next(err);
        }
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NON_HTML_RESPONSE');
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('defaults to 500 INTERNAL_SERVER_ERROR for unexpected errors with no code', async () => {
      const app = buildTestApp((_req, _res, next) => {
        next(new Error('Something went unexpectedly wrong'));
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    test('never leaks a stack trace in the response body', async () => {
      const app = buildTestApp((_req, _res, next) => {
        next(new Error('Sensitive internal error'));
      });

      const res = await request(app).get('/test');

      const bodyString = JSON.stringify(res.body);
      expect(bodyString).not.toContain('stack');
      expect(bodyString).not.toContain('at Object.');
      expect(bodyString).not.toContain('.js:');
    });

    test('handles a thrown non-Error string safely (no crash)', async () => {
      const app = buildTestApp((_req, _res, next) => {
        // eslint-disable-next-line no-throw-literal
        next('this is a plain string error');
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(typeof res.body.error.message).toBe('string');
    });

    test('handles a thrown non-Error object safely (no crash)', async () => {
      const app = buildTestApp((_req, _res, next) => {
        next({ weird: true });
      });

      const res = await request(app).get('/test');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
