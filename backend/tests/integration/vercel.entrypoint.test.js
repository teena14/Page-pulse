'use strict';

jest.mock('../../src/services/auditService');

const request = require('supertest');
const app = require('../../../api');
const { runAudit } = require('../../src/services/auditService');

describe('Vercel serverless entry point', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exports the Express app without changing the existing API route', async () => {
    const report = {
      url: 'https://example.com',
      httpStatus: 200,
      responseTime: 42,
      title: 'Example Domain',
      metaDescription: 'Example description',
      h1Count: 1,
      imagesMissingAlt: 0,
      wordCount: 12,
    };

    runAudit.mockResolvedValue(report);

    const res = await request(app)
      .post('/api/v1/audit')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject(report);
    expect(runAudit).toHaveBeenCalledWith('https://example.com');
  });

  test('also exposes a CommonJS default export for serverless runtimes', () => {
    expect(app.default).toBe(app);
  });
});
