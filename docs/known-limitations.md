# Known Limitations

Page Pulse is currently in Phase 1 of development. While robust within its scope, there are several known limitations you should be aware of.

## 1. No JavaScript Rendering
**Limitation:** The backend uses `axios` to download the raw HTML string from the target URL, and `cheerio` to parse it. It does not execute any JavaScript on the target page.
**Impact:** If a target website is a purely client-side rendered Single Page Application (like a default React or Vue app without Server Side Rendering), Page Pulse will likely report `0` for H1 tags, Word Count, and Missing Alt tags, because the content does not exist in the initial HTML payload.
**Possible Workaround:** Future integration of a headless browser (e.g., Puppeteer) could render the JS before parsing, at the cost of significantly higher server CPU/Memory usage and slower audit times.

## 2. Public Webpages Only
**Limitation:** Page Pulse runs from a centralized server and does not share your browser's context or cookies.
**Impact:** It cannot audit pages hidden behind authentication walls (e.g., a logged-in user dashboard), internal company networks, or pages that block server/bot traffic (e.g., Cloudflare bot protection).
**Possible Workaround:** For internal networks, you can host Page Pulse on your local network.

## 3. No Audit History or Persistent Storage
**Limitation:** The backend does not utilize a database.
**Impact:** Every time you click "Audit Page", a live request is made to the target website. The results are only held in the frontend's React state. If you refresh the browser, the report is lost.
**Possible Workaround:** Implement a database (like PostgreSQL) to store the URL, timestamp, and JSON payload of every successful request.

## 4. No Rate Limiting
**Limitation:** The current `POST /api/v1/audit` endpoint accepts unbounded traffic.
**Impact:** A malicious user could write a script to repeatedly request audits for massive webpages, potentially exhausting the backend server's bandwidth or CPU.
**Possible Workaround:** Integrate `express-rate-limit` to restrict the number of audits allowed per IP address per hour.

## 5. Approximate Word Count
**Limitation:** The word count algorithm strips `<script>`, `<style>`, and HTML tags, then splits the remaining text by whitespace.
**Impact:** It provides an *estimation* of visible words. It does not account for visually hidden CSS text (e.g., `display: none`), text embedded inside SVGs/Canvas, or highly complex dynamic layouts.
**Possible Workaround:** Accurate word count generally requires rendering the DOM and calculating the bounding boxes of text nodes, which requires headless browsers.
