# Deployment Notes

Page Pulse is designed to deploy as one Vercel project from the repository root. The React frontend is built as static files, and the Express backend runs as a Vercel Serverless Function.

## Vercel Deployment

Deploy the repository root as the Vercel project root. The serverless entry point is `api/index.js`, which imports the existing Express app from `backend/src/app.js` and exports it as the handler. The existing API route remains:

```text
POST /api/v1/audit
```

`vercel.json` routes `/api/*` requests to the Express function and serves the Vite build from `frontend/dist`.

### Environment Variables
No production environment variables are required for the current application.

The frontend calls the backend through the same origin at `/api/v1/audit`, so no `VITE_API_BASE_URL` is needed. Because frontend and backend share one Vercel domain, no CORS origin variable is needed either.

### Build & Run Commands
- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Output directory:** `frontend/dist`

### Security Considerations
- **CORS Setup**: No custom CORS configuration is required for the combined Vercel deployment because browser requests are same-origin.
- **Rate Limiting**: Add a package like `express-rate-limit` to prevent malicious users from spamming the audit endpoint and exhausting your server resources.

## Example Deployment Workflow

1. Import the GitHub repository into Vercel.
2. Set the project root to the repository root.
3. Use `npm install` as the install command.
4. Use `npm run build` as the build command.
5. Use `frontend/dist` as the output directory.
6. Deploy and test `POST /api/v1/audit` from the deployed frontend.
