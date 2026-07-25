'use strict';

// Manual Axios mock — replaces the real axios module in all tests via
// the moduleNameMapper in package.json.

const axios = {
  post: jest.fn(),
  create: jest.fn(() => axios),
};

module.exports = axios;
module.exports.default = axios;
