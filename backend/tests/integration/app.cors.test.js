'use strict';

const request = require('supertest');

function loadAppWithFrontendOrigin(frontendOrigin) {
  jest.resetModules();

  if (frontendOrigin === undefined) {
    delete process.env.FRONTEND_ORIGIN;
  } else {
    process.env.FRONTEND_ORIGIN = frontendOrigin;
  }

  return require('../../src/app');
}

describe('app CORS configuration', () => {
  const originalFrontendOrigin = process.env.FRONTEND_ORIGIN;

  afterEach(() => {
    if (originalFrontendOrigin === undefined) {
      delete process.env.FRONTEND_ORIGIN;
    } else {
      process.env.FRONTEND_ORIGIN = originalFrontendOrigin;
    }
  });

  test('allows all origins when FRONTEND_ORIGIN is not configured', async () => {
    const app = loadAppWithFrontendOrigin(undefined);

    const res = await request(app)
      .options('/api/v1/audit')
      .set('Origin', 'https://preview-app.vercel.app');

    expect(res.headers['access-control-allow-origin']).toBe('https://preview-app.vercel.app');
  });

  test('allows a configured frontend origin', async () => {
    const app = loadAppWithFrontendOrigin('https://page-pulse.vercel.app');

    const res = await request(app)
      .options('/api/v1/audit')
      .set('Origin', 'https://page-pulse.vercel.app');

    expect(res.headers['access-control-allow-origin']).toBe('https://page-pulse.vercel.app');
  });

  test('omits CORS headers for unconfigured browser origins', async () => {
    const app = loadAppWithFrontendOrigin('https://page-pulse.vercel.app');

    const res = await request(app)
      .options('/api/v1/audit')
      .set('Origin', 'https://someone-else.vercel.app');

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
