'use strict';

const fs = require('fs');
const path = require('path');
const { parseHtml } = require('../../../src/services/htmlParserService');

// ─── Fixture Loader ────────────────────────────────────────────────────────────

const fixturesDir = path.join(__dirname, '../../fixtures/mockHtml');

function loadFixture(filename) {
  return fs.readFileSync(path.join(fixturesDir, filename), 'utf-8');
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('parseHtml', () => {
  // ─── Happy Path ──────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('extracts all fields from a full, well-formed page', () => {
      const html = loadFixture('fullPage.html');
      const result = parseHtml(html);

      expect(result.title).toBe('Example Domain');
      expect(result.metaDescription).toBe('This is a full example page for testing.');
      expect(result.h1Count).toBe(1);
      expect(result.imagesMissingAlt).toBe(2); // bad1.jpg (no alt), bad2.jpg (alt="")
      expect(typeof result.wordCount).toBe('number');
      expect(result.wordCount).toBeGreaterThan(0);
    });

    test('returns a plain object with exactly the expected keys', () => {
      const html = loadFixture('fullPage.html');
      const result = parseHtml(html);
      const expectedKeys = ['title', 'metaDescription', 'h1Count', 'imagesMissingAlt', 'wordCount'];

      expectedKeys.forEach((key) => expect(result).toHaveProperty(key));
    });
  });

  // ─── Boundary Values ─────────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('handles an empty HTML body without throwing', () => {
      const html = loadFixture('emptyPage.html');
      expect(() => parseHtml(html)).not.toThrow();
    });

    test('returns safe defaults for an empty HTML body', () => {
      const html = loadFixture('emptyPage.html');
      const result = parseHtml(html);

      expect(result.title).toBe('');
      expect(result.metaDescription).toBe('');
      expect(result.h1Count).toBe(0);
      expect(result.imagesMissingAlt).toBe(0);
      expect(result.wordCount).toBe(0);
    });

    test('handles a huge HTML document without throwing or OOM', () => {
      const bigBody = '<p>' + 'word '.repeat(20000).trim() + '</p>';
      const html = `<!DOCTYPE html><html><head><title>Big</title></head><body>${bigBody}</body></html>`;
      expect(() => parseHtml(html)).not.toThrow();
      const result = parseHtml(html);
      expect(result.wordCount).toBe(20000);
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('returns empty string for title when <title> is missing', () => {
      const html = loadFixture('noTitle.html');
      const result = parseHtml(html);
      expect(result.title).toBe('');
    });

    test('still extracts other fields correctly when title is missing', () => {
      const html = loadFixture('noTitle.html');
      const result = parseHtml(html);
      expect(result.metaDescription).toBe('A page with no title tag.');
      expect(result.h1Count).toBe(1);
    });

    test('returns empty string for metaDescription when meta tag is missing', () => {
      const html = loadFixture('noMetaDescription.html');
      const result = parseHtml(html);
      expect(result.metaDescription).toBe('');
    });

    test('still extracts other fields correctly when meta description is missing', () => {
      const html = loadFixture('noMetaDescription.html');
      const result = parseHtml(html);
      expect(result.title).toBe('Page Without Meta Description');
      expect(result.h1Count).toBe(1);
    });

    test('returns 0 for h1Count when no <h1> tags are present', () => {
      const html = loadFixture('noH1.html');
      const result = parseHtml(html);
      expect(result.h1Count).toBe(0);
    });

    test('still extracts other fields correctly when h1 is missing', () => {
      const html = loadFixture('noH1.html');
      const result = parseHtml(html);
      expect(result.title).toBe('Page Without H1');
      expect(result.metaDescription).toBe('This page has no h1 tag.');
    });
  });
});
