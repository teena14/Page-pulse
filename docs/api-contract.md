# API Contract

# 1. Overview

## Purpose

The Page Pulse API provides a single endpoint that accepts a webpage URL, analyzes the page, and returns a structured audit report.

---

## Base URL

During development:

```text
http://localhost:5000
```

Production:

```text
https://your-domain.com
```

---

# 2. Endpoint Specification

## Analyze a Webpage

### Endpoint

```http
POST /api/v1/audit
```

---

### Why POST instead of GET?

Although this API only reads data, using `POST` is a reasonable design choice because:

* The URL is sent in the request body instead of the query string.
* It avoids URL length limitations.
* It keeps the request payload cleaner and easier to extend in the future (e.g., adding options like timeout or user agent).
* It prevents long URLs from appearing in browser history and server logs as query parameters.

> **Alternative:** A `GET /api/v1/audit?url=...` endpoint would also be acceptable for this assignment. We'll proceed with `POST` because it is more flexible.

---

# 3. Request

## Headers

```http
Content-Type: application/json
```

---

## Request Body

```json
{
  "url": "https://example.com"
}
```

---

## Field Definition

| Field | Type   | Required | Description        |
| ----- | ------ | -------- | ------------------ |
| url   | string | Yes      | Public webpage URL |

---

# 4. Successful Response

Status Code

```http
200 OK
```

## Response Headers

```http
Content-Type: application/json
```

---

Example

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "httpStatus": 200,
    "responseTime": 243,
    "title": "Example Domain",
    "metaDescription": "Example website used for documentation.",
    "h1Count": 1,
    "imagesMissingAlt": 0,
    "wordCount": 116
  },
  "timestamp": "2026-07-25T10:25:30Z"
}
```

---

# Field Definitions

| Field            | Type    | Description                                                                                                    |
| ---------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| success          | boolean | Indicates request success                                                                                      |
| url              | string  | Requested URL                                                                                                  |
| httpStatus       | number  | HTTP response status from the target website                                                                   |
| responseTime     | number  | Time (in milliseconds) taken by the backend to fetch the target webpage, measured from the outgoing request until the complete response is received. |
| title            | string  | HTML title                                                                                                     |
| metaDescription  | string  | Meta description                                                                                               |
| h1Count          | number  | Number of H1 tags                                                                                              |
| imagesMissingAlt | number  | Number of `<img>` elements missing a non-empty alt attribute.                                                    |
| wordCount        | number  | Approximate number of visible words extracted from the HTML body after removing scripts, styles, and markup.     |
| timestamp        | string  | ISO 8601 timestamp of when the audit was completed                                                             |

---

# 5. Error Response Format

All errors should follow a consistent structure.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not valid."
  }
}
```

This consistency makes error handling on the frontend much simpler.

---

# 6. Error Responses

## Invalid URL

Status

```http
400 Bad Request
```

```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The provided URL is not valid."
  }
}
```

---

## Missing URL

Status

```http
400 Bad Request
```

```json
{
  "success": false,
  "error": {
    "code": "MISSING_URL",
    "message": "URL is required."
  }
}
```

---

## Timeout

Status

```http
408 Request Timeout
```

```json
{
  "success": false,
  "error": {
    "code": "REQUEST_TIMEOUT",
    "message": "The target website took too long to respond."
  }
}
```

---

## Non-HTML Response

Status

```http
422 Unprocessable Entity
```

```json
{
  "success": false,
  "error": {
    "code": "NON_HTML_RESPONSE",
    "message": "Target URL did not return an HTML document."
  }
}
```

---

## Website Not Reachable

Status

```http
502 Bad Gateway
```

```json
{
  "success": false,
  "error": {
    "code": "UPSTREAM_ERROR",
    "message": "Unable to reach the target website."
  }
}
```

---

## Unexpected Server Error

Status

```http
500 Internal Server Error
```

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

# 7. Validation Rules

Before fetching the webpage, the backend should validate the input.

| Validation                                                   | Action       |
| ------------------------------------------------------------ | ------------ |
| Request body missing                                         | Return `400` |
| `url` field missing                                          | Return `400` |
| `url` is empty                                               | Return `400` |
| `url` is not a string                                        | Return `400` |
| Invalid URL format                                           | Return `400` |
| Unsupported protocol (anything other than `http` or `https`) | Return `400` |

---

# 8. Status Codes

| Status Code | Meaning                  | When Used                      |
| ----------- | ------------------------ | ------------------------------ |
| 200         | OK                       | Audit completed successfully   |
| 400         | Bad Request              | Invalid or missing input       |
| 408         | Request Timeout          | Target site timed out          |
| 422         | Unprocessable Entity     | Target resource is not HTML    |
| 502         | Bad Gateway              | Failed to fetch target website |
| 500         | Internal Server Error    | Unexpected server error        |

---

# 9. Example API Flow

```text
Client
   │
   │ POST /api/v1/audit
   ▼
Backend
   │
   ├── Validate URL
   │
   ├── Fetch webpage
   │
   ├── Measure response time
   │
   ├── Verify HTML response
   │
   ├── Parse HTML
   │
   ├── Extract metadata
   │
   └── Return JSON report
```

---

# 10. API Design Decisions

Documenting key design choices helps future contributors understand the rationale behind the API.

| Decision                | Reason                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Single endpoint         | The application performs one core operation: auditing a webpage.                                   |
| API Versioning (`/v1/`) | Demonstrates awareness of API evolution and prevents breaking changes for future clients.          |
| POST request            | Allows the URL to be sent in the request body and makes future request options easier to add.      |
| Uniform response format | Simplifies frontend parsing by always including a `success` field and a predictable structure.     |
| Structured error codes  | Enables frontend applications to react programmatically instead of relying only on error messages. |
| Consistent JSON schema  | Makes the API easier to maintain, document, and test.                                              |

---

## Redirect Handling

The backend follows HTTP redirects automatically before generating the report.

---

## Timeout Policy

Requests exceeding 10 seconds are aborted and return a `408 Request Timeout` response.

---

## API Assumptions

- Only publicly accessible webpages are supported.
- Only HTTP and HTTPS URLs are accepted.
- JavaScript-rendered content is not executed.
- Response metrics are based on the initial page fetch.
