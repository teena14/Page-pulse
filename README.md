# Page Pulse

A lightweight, robust, and fast webpage auditing tool. Page Pulse allows you to submit any public URL and receive a structured report detailing its HTTP status, response time, meta tags, and basic accessibility metrics.

---

## Features

- **Instant Audits**: Enter a URL and instantly receive an audit report.
- **Performance Metrics**: Measures total response time for the target URL.
- **Content Extraction**: Extracts the HTML title, meta description, and H1 tag counts.
- **Accessibility Check**: Counts the number of images missing an `alt` attribute.
- **Word Count**: Accurately estimates visible word count (excluding scripts and styles).
- **Graceful Error Handling**: Resilient against timeouts, DNS failures, and non-HTML responses.

---

## Tech Stack

### Frontend
- **React**: Component-based UI library.
- **Vite**: Ultra-fast build tool and development server.
- **CSS**: Pure vanilla CSS variables and animations (no bulky frameworks).

### Backend
- **Node.js**: Asynchronous JavaScript runtime.
- **Express**: Minimal and flexible API framework.

### Libraries
- **Axios**: Promise-based HTTP client for fetching remote pages.
- **Cheerio**: Lightning-fast HTML parsing (jQuery API for Node).

### Testing
- **Backend**: Jest & Supertest (Unit and Integration testing).
- **Frontend**: Vitest & React Testing Library.

---

## Design Decisions

Here are 3 key design decisions made during the development of Page Pulse:

1. **Cheerio over Headless Browsers (Puppeteer/Playwright)**
   - **Reasoning**: Headless browsers are incredibly resource-intensive and slow down the audit process significantly. Since our requirements are strictly structural (reading titles, meta tags, and counting specific elements), downloading the raw HTML via Axios and parsing it instantly with Cheerio keeps the backend extremely fast and lightweight.
2. **"Thin Controllers, Fat Services" Architecture**
   - **Reasoning**: By keeping the Express controllers thin and delegating the HTTP fetching and HTML parsing to a dedicated `auditService`, the core business logic remains highly testable. This decoupling makes it trivial to unit test the auditing engine without needing to mock Express request/response objects.
3. **Migrating Frontend Tests from Jest to Vitest**
   - **Reasoning**: Jest requires Babel to understand JSX and ESM, which added hundreds of unnecessary dependencies to the frontend. Since Vite is already used for the build step, switching to Vitest allows the tests to share the exact same transform pipeline as the app. This removed the Babel bloat and significantly sped up test execution.

---

## Project Structure

```text
page-pulse/
├── backend/
│   ├── src/
│   │   ├── controllers/      # HTTP request/response handlers
│   │   ├── routes/           # API endpoint definitions
│   │   ├── services/         # Core auditing business logic
│   │   ├── middlewares/      # Validation and global error handling
│   │   ├── utils/            # Pure functions (e.g., word counter, url validator)
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # Entry point
│   ├── tests/                # Jest & Supertest coverage
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI elements (Input, ReportCard)
│   │   ├── services/         # Axios API client layer
│   │   ├── App.jsx           # Root application component
│   │   └── main.jsx          # React DOM entry point
│   ├── tests/                # Vitest coverage
│   ├── package.json
│   └── vite.config.js
│
└── docs/                     # Project documentation
```

---

## Architecture Overview

Page Pulse uses a decoupled client-server architecture. The **Vite/React Frontend** captures input and manages UI state. When a user submits a URL, the frontend makes an HTTP POST request to the **Express Backend**. The backend validates the URL, fetches the remote HTML using Axios, parses it with Cheerio, and returns a structured JSON report. All errors are caught by a centralized middleware to ensure the frontend never receives unexpected HTML crash screens.

For more details, see [Architecture Documentation](docs/architecture.md).

---

## API Overview

### `POST /api/v1/audit`
Initiates a webpage audit.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "httpStatus": 200,
    "responseTime": 124,
    "title": "Example Domain",
    "metaDescription": "Example description",
    "h1Count": 1,
    "imagesMissingAlt": 0,
    "wordCount": 50
  },
  "timestamp": "2026-07-25T10:00:00Z"
}
```

For a comprehensive breakdown of error codes and field definitions, see [API Documentation](docs/api.md) or the [API Contract](docs/api-contract.md).

---

## Installation

Follow these steps to run the project locally.

### 1. Clone Repository
```bash
git clone https://github.com/your-username/page-pulse.git
cd page-pulse
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Run Backend
From the `backend/` directory:
```bash
npm start
```

### 5. Run Frontend
In a new terminal window, from the `frontend/` directory:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. In the central input field, type a valid, publicly accessible URL (e.g., `https://en.wikipedia.org/wiki/Main_Page`).
3. Click **"Audit Page"**.
4. The application will display a "Loading" state while the backend fetches and parses the page.
5. The full-width Report Card will appear below, displaying the HTTP Status, Response Time, Title, Meta Description, H1 Count, Missing Alt Images, and Word Count.

---

## Testing

The project is thoroughly tested with 100+ tests across the frontend and backend.

### Backend Tests (Jest)
Runs unit tests on utilities and integration tests on the Express API.
```bash
cd backend
npm test
```

### Frontend Tests (Vitest)
Runs unit and component tests using React Testing Library.
```bash
cd frontend
npm test
```

---

## Screenshots

### Home Screen
![Home Screen Placeholder](docs/images/home.png)

### Loading State
![Loading State Placeholder](docs/images/loading.png)

### Audit Report
![Audit Report Placeholder](docs/images/report.png)

### Error State
![Error State Placeholder](docs/images/error.png)

*(Note: Add actual screenshots to `docs/images/` and update these placeholder paths).*

---

## Known Limitations

- **No JavaScript Rendering**: The auditor fetches the raw HTML provided by the server. It does not execute client-side JavaScript (like React or Vue apps without SSR).
- **Public Webpages Only**: The backend cannot audit pages behind authentication walls or within private local networks.
- **No Persistent Storage**: Audit results are not saved to a database. Refreshing the page clears the report.
- **No Rate Limiting**: The current implementation does not restrict the number of audits a single user can perform.

For more details, see [Known Limitations](docs/known-limitations.md).

---

## Future Improvements

- **Lighthouse Integration**: Expand metrics to include Google Lighthouse performance, accessibility, and SEO scoring.
- **Database & Audit History**: Add PostgreSQL or MongoDB to save audit results and generate historical comparison charts.
- **JavaScript Rendering**: Implement Puppeteer or Playwright as an optional fallback backend service to audit highly dynamic SPAs.
- **Caching**: Implement a Redis cache for frequently audited URLs to save bandwidth and improve response times.
- **Rate Limiting**: Add `express-rate-limit` to the backend to protect against abuse and DDOS attacks.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Ensure all tests pass (`npm test` in both directories).
5. Push to the branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
