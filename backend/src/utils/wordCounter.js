'use strict';

/**
 * Counts the approximate number of visible words in an HTML string.
 *
 * Processing pipeline:
 *  1. Remove all <script>...</script> blocks (including content).
 *  2. Remove all <style>...</style> blocks (including content).
 *  3. Strip remaining HTML tags.
 *  4. Decode common HTML entities.
 *  5. Collapse whitespace and split into words.
 *
 * @param {import('cheerio').Cheerio} $body - Cheerio body context.
 * @returns {number} Approximate visible word count.
 */
function countWords($body) {
  if (!$body || typeof $body.find !== 'function') return 0;

  // Step 1: Clone to avoid mutating the original AST (if needed by other services)
  // We can just find script and style tags and remove them. 
  // Note: Since Cheerio mutations affect the tree, we should work on a clone.
  const clonedBody = $body.clone();

  // Step 2: Remove script and style tags completely
  clonedBody.find('script, style').remove();

  // Step 3: Extract HTML, replace tags with space to preserve word boundaries, and decode entities
  let text = clonedBody.html() || '';
  text = text.replace(/<[^>]*>/g, ' ');
  
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#?\w+;/gi, ' ');

  // Step 4: Collapse whitespace, trim, and split into words
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);

  return words.length;
}

module.exports = { countWords };
