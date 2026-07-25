# Page Pulse Test Plan

## 1. Testing Strategy

To ensure a robust and reliable application, the testing strategy is divided into four distinct phases:

- **Unit Testing**: Focuses on validating individual, isolated components (such as utility functions, validators, and specific HTML parsing logic) to ensure they work correctly in isolation without dependencies on network or database layers.
- **Integration Testing**: Focuses on the interaction between components, particularly the API layer. This ensures that the routes, middlewares, controllers, and services function together harmoniously to process a request and yield the correct structured JSON response.
- **Manual Testing**: Human verification of the UI/UX, edge cases, and unpredictable external network scenarios that are difficult to fully mock, ensuring the application handles real-world anomalies gracefully.

## 2. Scope

### In Scope
- URL string validation and sanitization
- HTTP request logic, timeout handling, and redirect following
- HTML parsing (extraction of title, meta description, H1 tags, and alt attributes)
- Text extraction and word count approximation
- Centralized error handling and predictable JSON error responses
- API endpoint (`POST /api/v1/audit`) request schema and response schema
- Frontend UI state management (loading, error, success rendering)

### Out of Scope
- Authentication and authorization testing
- Database and data persistence testing
- JavaScript execution or Single Page Application (SPA) rendering on target websites
- SEO scoring algorithms or Lighthouse integration
- Automated visual regression testing for the frontend

## 3. Test Environment

The testing environment mirrors the application's technology stack, utilizing standard industry tools:
- **Runtime**: Node.js
- **Frameworks**: Express (Backend), React (Frontend)
- **Dependencies**: Axios (HTTP Client), Cheerio (HTML Parsing)
- **Test Runners / Libraries**: 
  - **Jest**: The primary test runner and assertion library for backend unit and integration tests.
  - **Supertest**: Used alongside Jest to mock HTTP requests for testing the Express API routes without starting a physical server.
  - **Vitest**: The test runner used for the React frontend, integrating seamlessly with Vite without requiring Babel.

## 4. Test Cases

| Test ID | Category | Scenario | Input | Expected Result | Priority |
|---------|----------|----------|-------|-----------------|----------|
| TC-01 | Happy Path | Audit a standard valid webpage | `{"url": "https://example.com"}` | HTTP 200; returns structured JSON report with all metrics | High |
| TC-02 | Validation | Empty URL | `{}` or `{"url": ""}` | HTTP 400; `MISSING_URL` error | High |
| TC-03 | Validation | Malformed URL | `{"url": "not-a-url"}` | HTTP 400; `INVALID_URL` error | High |
| TC-04 | Validation | Unsupported Protocol | `{"url": "ftp://example.com"}` | HTTP 400; `INVALID_URL` error | High |
| TC-05 | Network | Request Timeout | URL that takes > 10s to respond | HTTP 408; `REQUEST_TIMEOUT` error | High |
| TC-06 | Network | Unreachable Host / DNS Failure | `{"url": "https://this-does-not-exist-1234.com"}` | HTTP 502; `UPSTREAM_ERROR` error | High |
| TC-07 | Network | SSL Failure | URL with expired/invalid SSL cert | HTTP 502; `UPSTREAM_ERROR` error | Medium |
| TC-08 | Edge Case | Target is a PDF | URL pointing to `.pdf` | HTTP 422; `NON_HTML_RESPONSE` error | High |
| TC-09 | Edge Case | Target is an Image | URL pointing to `.png` / `.jpg` | HTTP 422; `NON_HTML_RESPONSE` error | High |
| TC-10 | Network | Follow Redirects | URL that 301 redirects to another page | HTTP 200; Final page metrics returned | High |
| TC-11 | HTML Parse | Page without `<title>` | HTML string lacking `<title>` | HTTP 200; `title` is `null` or `""` | Medium |
| TC-12 | HTML Parse | Page without meta description | HTML string lacking meta description | HTTP 200; `metaDescription` is `null` or `""` | Medium |
| TC-13 | HTML Parse | Page without H1 | HTML string lacking `<h1>` | HTTP 200; `h1Count` is `0` | Medium |
| TC-14 | HTML Parse | Page without images | HTML string lacking `<img>` | HTTP 200; `imagesMissingAlt` is `0` | Low |
| TC-15 | HTML Parse | Missing / Empty alt attributes | HTML with `<img src="...">` and `<img src="..." alt="">` | HTTP 200; `imagesMissingAlt` correctly increments for both | High |
| TC-16 | Boundary | Huge HTML page | URL returning a massive HTML document | HTTP 200; Processed without crashing or OOM errors | Medium |
| TC-17 | Boundary | Empty HTML | Target returns 200 OK but an empty body | HTTP 200; All metrics default to 0/empty/null safely | Medium |
| TC-18 | Network | Target website returns 404 or 500 | URL of a page that responds with a 4xx/5xx status | API returns HTTP 200; `httpStatus` field in `data` reflects the target's actual status code (e.g., `404`). Not to be confused with the API's own `500 INTERNAL_SERVER_ERROR`. | High |
| TC-19 | Edge Case | Target is a ZIP file | URL pointing to `.zip` | HTTP 422; `NON_HTML_RESPONSE` error | High |
| TC-20 | Network | Redirect loop on target URL | URL that triggers an infinite redirect chain | HTTP 408; `REQUEST_TIMEOUT` error — the loop is resolved by the existing 10-second timeout policy rather than hanging indefinitely | Medium |

## 5. Unit Test Plan

Unit testing will strictly target pure functions and isolated business logic layers. The following modules will receive comprehensive unit tests:

- **URL Validator**: Tests that verify regex logic correctly identifies valid URLs, rejects missing/empty URLs, and rejects non-HTTP/HTTPS protocols.
- **HTML Parser Service**: Given a static mock HTML string, tests will verify that Cheerio correctly traverses the DOM and extracts exact node counts and text content.
- **Word Counter Utility**: Tests that verify the stripping of `<script>`, `<style>`, and HTML tags, outputting an accurate approximation of visible words.
- **Image Analyzer**: Verifies the logic determining if an image tag is considered "missing an alt attribute" (e.g., no alt vs. empty string alt).

## 6. Integration Test Plan

Integration tests will validate the `POST /api/v1/audit` endpoint from request to response using **Supertest**. 

Verifications will include:
- **Request Validation**: Ensuring the middleware correctly intercepts bad payloads and immediately returns a `400 Bad Request` without hitting the controller.
- **Controller/Service Handshake**: Using mocked responses for `Axios`, ensuring that the controller correctly calls the service and formats the final JSON.
- **Response Schema**: Asserting that a successful response perfectly matches the agreed API contract (keys, types, and the presence of a timestamp).
- **Error Handling**: Asserting that external network failures (mocked Axios timeouts or 500s) bubble up through the global error handler and return the standardized JSON error structure without leaking stack traces.

## 7. Manual Testing Checklist

Following automated test execution, the following manual checks should be performed:

- [ ] Boot the frontend and backend locally.
- [ ] Enter a known valid URL in the UI and click "Audit". Verify the loading state appears.
- [ ] Verify the UI transitions from the loading state to the result dashboard.
- [ ] Enter an invalid string in the UI; verify immediate client-side validation feedback.
- [ ] Enter a valid URL pointing to a non-existent domain; verify the backend gracefully handles the failure and the UI displays the `UPSTREAM_ERROR` message.
- [ ] Disconnect from the internet and attempt an audit to verify local network failure handling.
- [ ] Test the UI on different screen sizes (mobile, tablet, desktop) to ensure the report renders cleanly.

## 8. Exit Criteria

The testing phase is considered complete when:
- All defined unit and integration tests are passing in the CI/CD pipeline.
- The implemented API precisely satisfies the `docs/api-contract.md`.
- No unhandled exceptions or crashes occur during the manual edge-case testing.
- The UI handles both success data and all standardized error codes predictably.
