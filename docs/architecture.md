# Page Pulse Architecture

## 1. Overview

The Page Pulse application follows a standard client-server architecture, decoupled into a frontend and a backend layer. The frontend is a lightweight Single Page Application (SPA) responsible for capturing user input and rendering the audit report. The backend is an API server responsible for the heavy lifting: fetching remote webpages, parsing their HTML, and compiling the audit metrics. This separation ensures that the frontend remains responsive and the backend can be scaled independently.

## 2. High-Level Architecture Diagram

```text
       [ User ]
          │
          ▼
 [ React Frontend ]
          │
          │ (POST /api/v1/audit)
          ▼
 [ Express Backend ]
          │
          ▼
  [ Audit Service ]
          │
          ▼
 [ Target Website ]
          │
          │ (HTML Response)
          ▼
   [ HTML Parser ]
          │
          ▼
 [ JSON Response ]
```

## 3. Technology Stack

### Backend
- **Node.js**: Provides a fast, non-blocking I/O runtime, ideal for handling numerous concurrent HTTP requests to external websites.
- **Express**: A minimal web framework that simplifies routing, middleware integration, and API endpoint creation.
- **Axios**: A promise-based HTTP client used to fetch external webpages with built-in timeout and redirect support.
- **Cheerio**: A fast, flexible, and lean implementation of core jQuery designed specifically for the server. Chosen because it parses raw HTML strings rapidly without the heavy overhead of headless browser rendering.

### Frontend
- **React**: A component-based UI library that enables declarative rendering of state (e.g., loading, error, success states).
- **Vite**: A modern frontend build tool that provides incredibly fast Hot Module Replacement (HMR) and optimized production builds.

### Shared / Global
- **CORS**: Middleware to allow the React frontend (running on a different port/domain) to securely communicate with the Express backend.
- **dotenv**: Manages environment variables, ensuring sensitive configuration (like ports or API limits) remains out of the source code.

## 4. Project Folder Structure

```text
page-pulse/
│
├── backend/
│   ├── src/
│   │   ├── controllers/      # Handles HTTP request/response logic
│   │   ├── routes/           # Maps URL endpoints to controllers
│   │   ├── services/         # Contains core business logic (fetching, parsing)
│   │   ├── middlewares/      # Reusable functions for validation, error handling, etc.
│   │   ├── utils/            # Helper functions (e.g., word count calculation)
│   │   ├── config/           # Application configuration and environment setup
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # Entry point to start the server
│   ├── tests/
│   │   ├── unit/             # Jest tests for utils and services in isolation
│   │   ├── integration/      # Supertest tests for routes and middlewares
│   │   └── fixtures/         # Shared mock data (e.g., mockHtml.js, mockResponses.js)
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI elements (Input, Button, Result Cards)
│   │   ├── pages/            # Top-level route components
│   │   ├── services/         # Frontend API communication logic
│   │   ├── App.jsx           # Root component
│   │   └── main.jsx          # React DOM entry point
│   ├── tests/
│   │   └── unit/             # Vitest tests for components and frontend services
│   ├── package.json
│   └── vite.config.js
│
├── docs/                     # Project documentation (requirements, API, architecture)
├── README.md
└── .gitignore
```

## 5. Backend Layer Responsibilities

The backend is structured around a classic 3-tier architecture to enforce separation of concerns:

- **Routes (`/routes`)**: The entry point for incoming requests. Responsible only for mapping specific HTTP verbs and paths (e.g., `POST /api/v1/audit`) to the corresponding controller.
- **Controllers (`/controllers`)**: The conductor of the request. They extract data from the incoming request, invoke the necessary services, and formulate the final HTTP response (success or failure). They contain no complex business logic.
- **Services (`/services`)**: The core engine of the application. Services handle the heavy lifting, such as initiating external HTTP requests, parsing HTML, and compiling the audit metrics. They are agnostic to HTTP transport layers.
- **Middlewares (`/middlewares`)**: Functions that intercept the request before it reaches the controller. Used for centralized error handling and request validation.
- **Utilities (`/utils`)**: Pure, reusable helper functions that perform specific, isolated tasks (e.g., string sanitization, word counting).
- **Config (`/config`)**: Centralized management of environment variables and application-wide settings.

## 6. Request Lifecycle

The flow of a typical API request follows a strict, unidirectional path:

```text
   [ Client ]
       │
       ▼
 [ Express Route ]         <- Matches the POST /api/v1/audit endpoint
       │
       ▼
[ Validation Middleware ]  <- Validates URL presence and format
       │
       ▼
 [ Controller ]            <- Receives validated request, calls Audit Service
       │
       ▼
 [ Audit Service ]         <- Orchestrates the audit process
       │
       ├──> [ Fetch Webpage ]  <- Uses Axios to GET the target URL
       │
       ├──> [ Parse HTML ]     <- Feeds the response data into Cheerio
       │
       └──> [ Generate Report ]<- Extracts titles, tags, and counts
       │
       ▼
 [ Controller ]            <- Receives the final report object
       │
       ▼
 [ JSON Response ]         <- Sends HTTP 200 with the formatted JSON
```

## 7. Frontend Architecture

The React frontend is component-driven, isolating specific responsibilities to individual parts of the UI:

- **Input Component**: Captures the URL string and performs basic client-side validation to prevent unnecessary API calls.
- **Submit Button**: Triggers the audit process and visually indicates when a process is active.
- **API Service**: Encapsulates the Axios HTTP calls to the backend, abstracting away endpoints and network logic from the UI components.
- **Loading State**: Visual feedback (e.g., a spinner or skeleton loader) displayed while awaiting the backend response.
- **Error State**: Gracefully displays user-friendly error messages parsed from the backend's structured error responses.
- **Report Component**: Takes the structured JSON data and maps it into a readable, visually appealing dashboard.

## 8. Error Handling Strategy

Errors are managed predictably across the entire application:

- **Centralized Error Handling**: The backend utilizes an Express global error-handling middleware. Any error thrown in a service or controller is caught and processed here.
- **Validation**: Inputs are strictly validated via middleware before reaching the controller, returning immediately if invalid.
- **Try/Catch Blocks**: Asynchronous operations (like fetching the webpage) are wrapped in try/catch blocks to gracefully handle network failures or timeouts.
- **Hiding Internal Stack Traces**: The error handler ensures that stack traces and sensitive internal server details are stripped before sending the consistent JSON error response to the client.

## 9. Design Decisions

- **Thin Controllers, Fat Services**: By keeping controllers thin, business logic remains highly testable and reusable. The controller only cares about HTTP; the service only cares about the audit logic.
- **API Versioning**: Implementing `/v1/` ensures that future iterations of the audit engine will not break existing frontend clients.
- **Modular Architecture**: Splitting the codebase into specific layers (routes, controllers, services) prevents spaghetti code and makes the repository easier to navigate for new developers.
- **Reusable Utilities**: Logic like word counting is decoupled into pure functions, allowing for easy unit testing without mocking HTTP requests.
- **Separation of Concerns**: Both frontend and backend are maintained as distinct modules, allowing them to be deployed, scaled, and maintained independently.

## 10. Scalability

The current architecture is designed to accommodate future growth without major refactoring:

- **Additional Audit Metrics**: New parsers can be seamlessly added to the Audit Service without touching the controllers or routes.
- **Database Integration**: A data layer (e.g., PostgreSQL or MongoDB) can be introduced via a Repository pattern to save historical audits.
- **Authentication**: JWT-based authentication middleware can be plugged into the routes to protect specific endpoints.
- **Caching**: A Redis layer can be introduced before the controller to serve recent audits of the same URL instantly.
- **Queue Workers**: For long-running or complex audits, the architecture can be extended by placing the Audit Service logic into background workers (e.g., BullMQ) and returning a job ID to the client.

## 11. Future Improvements

While out of scope for Phase 1, the architecture supports several natural evolutions:

- **JavaScript Rendering**: Replacing Cheerio with a headless browser (Puppeteer) to audit Single Page Applications.
- **Lighthouse Integration**: Piping the URL to a Google Lighthouse instance for comprehensive performance and accessibility scoring.
- **Audit History**: Introducing a database to track changes in a website's metrics over time.
- **Rate Limiting**: Adding API gateway rules or application-level middleware to prevent abuse.
- **Background Jobs**: Transitioning from synchronous HTTP responses to asynchronous webhooks or polling for highly detailed audits.
