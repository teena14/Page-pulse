'use strict';

const cheerio = require('cheerio');
const { countWords } = require('../utils/wordCounter');
const { countMissingAlt } = require('../utils/imageAnalyzer');

/**
 * Parses a raw HTML string and extracts audit metadata.
 *
 * Extracted fields:
 *  - title           {string}  Contents of <title>, or '' if absent.
 *  - metaDescription {string}  Content of <meta name="description">, or '' if absent.
 *  - h1Count         {number}  Number of <h1> elements.
 *  - imagesMissingAlt{number}  <img> elements missing a non-empty alt attribute.
 *  - wordCount       {number}  Approximate visible word count (scripts/styles stripped).
 *
 * @param {string} html - Raw HTML string to parse.
 * @returns {{ title: string, metaDescription: string, h1Count: number, imagesMissingAlt: number, wordCount: number }}
 */
function parseHtml(html) {
  const $ = cheerio.load(html || '');

  const title = $('title').first().text().trim() || '';

  const metaDescriptionTag = $('meta[name="description"]').first();
  const metaDescription = metaDescriptionTag.attr('content')?.trim() || '';

  const h1Count = $('h1').length;

  // Scope both counters to body HTML only — head content (title text, etc.)
  // is not visible to users and must not inflate the word/image counts.
  const $body = $('body');

  const imagesMissingAlt = countMissingAlt($body);

  const wordCount = countWords($body);

  return {
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount,
  };
}

module.exports = { parseHtml };
