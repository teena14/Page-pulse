'use strict';

const cheerio = require('cheerio');

/**
 * Counts the number of <img> elements in an HTML string that are missing
 * a non-empty alt attribute.
 *
 * An image is considered to have a "missing" alt attribute when:
 *  - The alt attribute is absent entirely.
 *  - The alt attribute is an empty string (alt="").
 *  - The alt attribute contains only whitespace characters.
 *
 * @param {import('cheerio').Cheerio} $body - Cheerio body context to analyze.
 * @returns {number} Count of <img> elements with missing or empty alt attributes.
 */
function countMissingAlt($body) {
  if (!$body || typeof $body.find !== 'function') return 0;

  let missingCount = 0;

  $body.find('img').each((_index, el) => {
    // We can't use $(el) because we don't have the root $ here easily.
    // But we know it's a Cheerio element, so we can access attributes via el.attribs
    const alt = el.attribs && el.attribs.alt;

    // Missing alt attribute entirely
    if (alt === undefined) {
      missingCount++;
      return;
    }

    // Empty string or whitespace-only alt
    if (alt.trim() === '') {
      missingCount++;
    }
  });

  return missingCount;
}

module.exports = { countMissingAlt };
