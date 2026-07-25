# Page Pulse Requirements

## Project Goal
The Page Pulse application audits any publicly accessible webpage and returns a structured report containing technical and SEO-related information.

## Functional Requirements

### Backend
The backend must:
- accept a URL
- validate the URL
- fetch the webpage
- measure response time
- detect HTTP status
- extract page title
- extract meta description
- count H1 tags
- count images missing alt attributes
- estimate visible word count
- return a structured JSON response

### Frontend
The frontend must:
- provide a URL input
- provide an audit button
- display loading state
- display audit results
- display errors gracefully

### Error Handling
Expected handling for:
- invalid URLs
- unreachable hosts
- DNS failures
- SSL failures
- request timeout
- redirects
- non-HTML responses
- unexpected server errors

The application should never crash due to invalid user input or external failures.

## Non-Functional Requirements
- maintainable architecture
- modular code
- readable API responses
- clean UI
- reasonable performance
- consistent error responses

## Out of Scope
- authentication
- login
- database
- user accounts
- history
- SEO scoring
- Lighthouse
- screenshots
- JavaScript rendering

## Assumptions
- URL is public
- internet connection exists
- only HTML pages are analyzed
- JavaScript-rendered content is ignored
- approximate word count is acceptable
- one page is processed per request

## Acceptance Criteria
The project is considered complete when:
- valid URLs return a complete report
- frontend displays results correctly
- invalid URLs produce validation errors
- non-HTML pages return meaningful errors
- timeout errors are handled
- no unhandled exceptions occur

## Edge Cases
- empty URL
- missing protocol
- redirects
- 404
- 500
- PDF
- image URLs
- ZIP files
- DNS failure
- SSL failure
- timeout
- huge HTML page
- empty HTML
- missing title
- missing meta description
- missing H1
- zero images

## Questions / Future Clarifications
- Should redirects be followed?
- What timeout should be used?
- Should authenticated pages be supported?
- Should JavaScript-rendered pages be evaluated?

Reasonable assumptions will be made for this assignment.
