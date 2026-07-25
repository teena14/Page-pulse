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
 * @param {string} html - Raw HTML string to analyze.
 * @returns {number} Count of <img> elements with missing or empty alt attributes.
 */
function countMissingAlt(html) {
  if (!html || typeof html !== 'string') return 0;

  const $ = cheerio.load(html);
  let missingCount = 0;

  $('img').each((_index, el) => {
    const alt = $(el).attr('alt');

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
