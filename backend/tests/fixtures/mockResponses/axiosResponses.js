'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Simulates a successful Axios response for an HTML page.
 */
const successHtmlResponse = {
  status: 200,
  headers: { 'content-type': 'text/html; charset=utf-8' },
  data: fs.readFileSync(
    path.join(__dirname, '../mockHtml/fullPage.html'),
    'utf-8'
  ),
};

/**
 * Simulates a successful Axios response where the final URL is the result
 * of a redirect chain (Axios resolves this transparently).
 */
const redirectResolvedResponse = {
  status: 200,
  headers: { 'content-type': 'text/html; charset=utf-8' },
  data: '<html><head><title>Redirected Page</title></head><body><h1>Final destination</h1></body></html>',
  request: { res: { responseUrl: 'https://final-destination.com/' } },
};

/**
 * Simulates a non-HTML content-type response (PDF).
 */
const pdfResponse = {
  status: 200,
  headers: { 'content-type': 'application/pdf' },
  data: '%PDF-1.4 binary content',
};

/**
 * Simulates a non-HTML content-type response (image).
 */
const imageResponse = {
  status: 200,
  headers: { 'content-type': 'image/png' },
  data: Buffer.from('PNG binary'),
};

/**
 * Simulates a non-HTML content-type response (ZIP).
 */
const zipResponse = {
  status: 200,
  headers: { 'content-type': 'application/zip' },
  data: Buffer.from('PK binary'),
};

/**
 * Simulates an Axios DNS / network unreachable error.
 */
const dnsError = Object.assign(new Error('getaddrinfo ENOTFOUND this-does-not-exist.com'), {
  code: 'ENOTFOUND',
});

/**
 * Simulates an Axios request timeout error.
 */
const timeoutError = Object.assign(new Error('timeout of 10000ms exceeded'), {
  code: 'ECONNABORTED',
});

module.exports = {
  successHtmlResponse,
  redirectResolvedResponse,
  pdfResponse,
  imageResponse,
  zipResponse,
  dnsError,
  timeoutError,
};
