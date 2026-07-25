# Deployment Notes

Page Pulse is designed to be easily deployed to modern cloud platforms. Because the frontend and backend are decoupled, you will deploy them as two separate services.

## 1. Backend Deployment

The backend is a standard Node.js Express application. It can be deployed to platforms like Render, Heroku, Railway, or AWS.

### Production Environment Variables
| Variable | Description |
|---|---|
| `PORT` | The platform will usually inject this automatically (e.g., Render sets `PORT=10000`). |
| `NODE_ENV` | Set this to `production` to optimize Express performance. |

### Build & Run Commands
- **Install command:** `npm install --production`
- **Start command:** `npm start` (or `node src/server.js`)

### Security Considerations
- **CORS Setup**: In development, `app.use(cors())` allows all origins. For production, you should restrict CORS to ONLY your frontend domain.
  ```javascript
  // Example update in app.js
  app.use(cors({ origin: 'https://your-frontend-domain.com' }));
  ```
- **Rate Limiting**: Add a package like `express-rate-limit` to prevent malicious users from spamming the audit endpoint and exhausting your server resources.

---

## 2. Frontend Deployment

The frontend is a static React application built with Vite. It can be hosted entirely for free on platforms like Vercel, Netlify, or Cloudflare Pages.

### Production Environment Variables
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | The public URL of your deployed backend (e.g., `https://api.your-backend.com`). **This is strictly required in production.** |

### Build & Run Commands
- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Publish directory:** `dist/`

### Deployment Considerations
- **Environment Variable Timing**: Because this is a static build, `VITE_API_BASE_URL` must be set in your deployment dashboard *before* the build step runs. Once built, the URL is hardcoded into the Javascript bundle.
- **Routing**: If you ever add client-side routing (e.g., React Router), ensure your static host is configured to rewrite all traffic to `index.html`. 

## Example Deployment Workflow

1. Deploy the `backend/` folder to a service like Render. Wait for the live URL (e.g., `https://page-pulse-api.onrender.com`).
2. Go to Vercel/Netlify to deploy the `frontend/` folder.
3. In the Vercel dashboard, add `VITE_API_BASE_URL=https://page-pulse-api.onrender.com`.
4. Trigger the frontend build.
5. Visit your live frontend URL.
