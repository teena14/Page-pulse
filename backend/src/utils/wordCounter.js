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
 * @param {string} html - Raw HTML string.
 * @returns {number} Approximate visible word count.
 */
function countWords(html) {
  if (!html || typeof html !== 'string') return 0;

  let text = html;

  // Step 1: Remove <script> blocks and their content
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  // Step 2: Remove <style> blocks and their content
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  // Step 3: Strip all remaining HTML tags (handles malformed/unclosed tags)
  text = text.replace(/<[^>]*>/g, ' ');

  // Step 4: Decode common HTML entities to avoid counting entity refs as words
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#?\w+;/gi, ' ');

  // Step 5: Collapse whitespace, trim, and split into words
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);

  return words.length;
}

module.exports = { countWords };
