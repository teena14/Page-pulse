'use strict';

const cheerio = require('cheerio');
const { countMissingAlt: originalCountMissingAlt } = require('../../../src/utils/imageAnalyzer');

const countMissingAlt = (html) => originalCountMissingAlt(cheerio.load(html)('body'));

describe('countMissingAlt', () => {
  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('returns 0 when all images have a non-empty alt attribute', () => {
      const html = `
        <img src="cat.jpg" alt="A cat" />
        <img src="dog.jpg" alt="A dog" />
      `;
      expect(countMissingAlt(html)).toBe(0);
    });

    test('counts only the images missing alt in a mixed set', () => {
      const html = `
        <img src="good.jpg" alt="Described" />
        <img src="bad1.jpg" />
        <img src="bad2.jpg" alt="" />
        <img src="bad3.jpg" alt="   " />
      `;
      // bad1 (no alt), bad2 (empty alt), bad3 (whitespace-only alt) = 3
      expect(countMissingAlt(html)).toBe(3);
    });
  });

  // ─── Boundary Values ───────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('returns 0 when there are no <img> tags at all', () => {
      const html = '<p>No images here</p>';
      expect(countMissingAlt(html)).toBe(0);
    });

    test('returns 0 for an empty HTML string', () => {
      expect(countMissingAlt('')).toBe(0);
    });

    test('counts all images when every <img> is missing alt', () => {
      const html = `
        <img src="a.jpg" />
        <img src="b.jpg" />
        <img src="c.jpg" />
      `;
      expect(countMissingAlt(html)).toBe(3);
    });

    test('handles a single image with a valid alt correctly', () => {
      expect(countMissingAlt('<img src="x.jpg" alt="Valid" />')).toBe(0);
    });

    test('handles a single image with no alt correctly', () => {
      expect(countMissingAlt('<img src="x.jpg" />')).toBe(1);
    });
  });

  // ─── Failure Modes ─────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('counts alt="" (empty string) as missing', () => {
      const html = '<img src="a.jpg" alt="" />';
      expect(countMissingAlt(html)).toBe(1);
    });

    test('counts alt with only whitespace as missing', () => {
      const html = '<img src="a.jpg" alt="   " />';
      expect(countMissingAlt(html)).toBe(1);
    });

    test('counts alt with tab/newline whitespace as missing', () => {
      const html = '<img src="a.jpg" alt="\t\n" />';
      expect(countMissingAlt(html)).toBe(1);
    });

    test('counts an <img> with no src as missing alt (still an img element)', () => {
      const html = '<img />';
      expect(countMissingAlt(html)).toBe(1);
    });

    test('does not throw on malformed/unclosed HTML', () => {
      const html = '<img src="broken.jpg" alt="ok"><p>unclosed';
      expect(() => countMissingAlt(html)).not.toThrow();
      expect(countMissingAlt(html)).toBe(0);
    });
  });
});
