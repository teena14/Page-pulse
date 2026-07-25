# Page Pulse API Reference

The Page Pulse API allows developers to programmatically request website audits. It accepts a target URL and returns a structured JSON payload detailing basic performance, accessibility, and SEO metrics.

## Endpoint

```http
POST /api/v1/audit
```

### Request Headers
- `Content-Type: application/json`

### Request Body
The body must be a JSON object containing a single required field.

```json
{
  "url": "https://example.com"
}
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `url` | string | **Yes** | The absolute URL of the public webpage you wish to audit. Must include `http://` or `https://`. |

---

## Success Response (200 OK)

A successful request returns a `200 OK` status with the complete audit report.

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "httpStatus": 200,
    "responseTime": 150,
    "title": "Example Website",
    "metaDescription": "A test meta description.",
    "h1Count": 1,
    "imagesMissingAlt": 2,
    "wordCount": 350
  },
  "timestamp": "2026-07-25T10:00:00.000Z"
}
```

### Response Object Definition

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Always `true` on successful audits. |
| `data` | object | The audit report containing all extracted metrics. |
| `data.url` | string | The URL that was audited. |
| `data.httpStatus` | number | The exact HTTP status code returned by the target webpage (e.g., 200, 404). |
| `data.responseTime` | number | The time taken (in milliseconds) by the backend to fetch the HTML payload. |
| `data.title` | string / null | The text content of the page's `<title>` tag. |
| `data.metaDescription` | string / null | The content of the `<meta name="description">` tag. |
| `data.h1Count` | number | The total number of `<h1>` tags found in the document body. |
| `data.imagesMissingAlt` | number | The number of `<img>` tags missing a valid, non-empty `alt` attribute. |
| `data.wordCount` | number | The approximate count of visible words extracted from the `<body>` tag. |
| `timestamp` | string | The ISO 8601 timestamp of when the response was generated. |

---

## Error Responses

The API uses standard HTTP status codes and a consistent JSON error schema for all failures.

**Standard Error Schema:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of the error."
  }
}
```

### Common Errors

| HTTP Status | Error Code | Description |
|---|---|---|
| **400** | `MISSING_URL` | The `url` field was not provided in the request body. |
| **400** | `INVALID_URL` | The provided string is not a valid URL or uses an unsupported protocol. |
| **408** | `REQUEST_TIMEOUT` | The target website took longer than 10 seconds to respond, or got caught in a redirect loop. |
| **422** | `NON_HTML_RESPONSE` | The target URL did not return an HTML document (e.g., it returned a PDF or image). |
| **502** | `UPSTREAM_ERROR` | The backend failed to connect to the target host (DNS failure, invalid SSL, network error). |
| **500** | `INTERNAL_SERVER_ERROR` | An unhandled exception occurred in the Page Pulse backend. |
