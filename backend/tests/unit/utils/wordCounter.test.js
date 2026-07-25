'use strict';

const cheerio = require('cheerio');
const { countWords: originalCountWords } = require('../../../src/utils/wordCounter');

const countWords = (html) => originalCountWords(cheerio.load(html)('body'));

describe('countWords', () => {
  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('counts words in a normal plain-text paragraph', () => {
      const html = '<p>The quick brown fox jumps over the lazy dog</p>';
      expect(countWords(html)).toBe(9);
    });

    test('counts words across multiple elements', () => {
      const html = '<h1>Hello World</h1><p>This is a test sentence.</p>';
      // "Hello World This is a test sentence" = 7 words
      expect(countWords(html)).toBe(7);
    });
  });

  // ─── Boundary Values ───────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('returns 0 for an empty string', () => {
      expect(countWords('')).toBe(0);
    });

    test('returns 1 for a single visible word', () => {
      expect(countWords('<p>Hello</p>')).toBe(1);
    });

    test('handles a huge HTML blob without throwing', () => {
      const bigParagraph = '<p>' + 'word '.repeat(10000).trim() + '</p>';
      expect(() => countWords(bigParagraph)).not.toThrow();
      expect(countWords(bigParagraph)).toBe(10000);
    });
  });

  // ─── Failure Modes ─────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('strips <script> tags and does not count their content as words', () => {
      const html = '<p>Visible text</p><script>var x = "hidden script content";</script>';
      // Only "Visible text" = 2 words
      expect(countWords(html)).toBe(2);
    });

    test('strips <style> tags and does not count their content as words', () => {
      const html = '<p>Real words</p><style>body { font-size: 16px; color: red; }</style>';
      // Only "Real words" = 2 words
      expect(countWords(html)).toBe(2);
    });

    test('returns 0 for HTML with only tags and no visible text', () => {
      const html = '<div><span></span><img src="photo.jpg" alt=""/></div>';
      expect(countWords(html)).toBe(0);
    });

    test('returns 0 for HTML containing only whitespace and tags', () => {
      const html = '<p>   </p><div>  </div>';
      expect(countWords(html)).toBe(0);
    });

    test('handles malformed/unclosed tags gracefully without throwing', () => {
      const html = '<p>Some text <b>bold without closing';
      expect(() => countWords(html)).not.toThrow();
      // At minimum, the visible words should be counted
      expect(countWords(html)).toBeGreaterThanOrEqual(4);
    });
  });
});
