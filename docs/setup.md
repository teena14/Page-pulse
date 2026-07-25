# Local Setup Guide

Follow this guide to get Page Pulse running on your local machine for development or testing.

## Prerequisites

Ensure you have the following installed before proceeding:
- [Node.js](https://nodejs.org/en/) (v20 or higher recommended)
- `npm` (comes bundled with Node.js)
- Git

---

## Installation

Clone the repository to your local machine:
```bash
git clone https://github.com/your-username/page-pulse.git
cd page-pulse
```

Install all workspace dependencies from the repository root:
```bash
npm install
```

The root npm workspace installs both `backend` and `frontend`.

---

## Running Locally

To run the full stack, you will need two terminal windows.

**1. Start the Backend:**
```bash
npm start --workspace backend
```
You should see: `Server listening on port 5000`

**2. Start the Frontend:**
```bash
npm run dev --workspace frontend
```
You should see the Vite logo and a local URL, typically: `http://localhost:3000`

Open your browser and navigate to the frontend URL to start auditing pages!

---

## Running Tests

We maintain strict test coverage to prevent regressions.

**Backend Unit & Integration Tests (Jest):**
```bash
npm test --workspace backend
```

**Frontend Unit Tests (Vitest):**
```bash
npm test --workspace frontend
```

**All Tests:**
```bash
npm test
```

---

## Troubleshooting

### "Error: connect ECONNREFUSED 127.0.0.1:5000"
**Cause:** The frontend cannot reach the backend.
**Solution:** Ensure you are running the backend (`npm start` in the `backend/` folder) and that it is listening on port 5000. 

### Tests fail with "Cannot use import statement outside a module"
**Cause:** You are running the frontend tests with Jest instead of Vitest.
**Solution:** Ensure you pulled the latest `package.json` where the test script was updated to `vitest run`, and run `npm install` again to clean up old dependencies.

### CORS Errors in the Browser Console
**Cause:** The frontend is hosted on a different domain/port than the backend, and the backend isn't allowing it.
**Solution:** In local development, the Vite dev server proxies `/api` requests to the backend on `http://127.0.0.1:5000`. Make sure both the frontend and backend dev servers are running.
