import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportCard from '../../../src/components/ReportCard';

describe('ReportCard Component', () => {
  const fullReport = {
    url: 'https://example.com',
    httpStatus: 200,
    responseTime: 120,
    title: 'Example Title',
    metaDescription: 'Example Meta Description',
    h1Count: 1,
    imagesMissingAlt: 2,
    wordCount: 500,
  };

  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('renders all report fields correctly when full data is provided', () => {
      render(<ReportCard report={fullReport} />);
      
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('Status:').parentElement).toHaveTextContent('200');
      expect(screen.getByText('Response Time:').parentElement).toHaveTextContent('120ms');
      expect(screen.getByText('Example Title')).toBeInTheDocument();
      expect(screen.getByText('Example Meta Description')).toBeInTheDocument();
      expect(screen.getByText('H1 Count:').parentElement).toHaveTextContent('1');
      expect(screen.getByText('Images Missing Alt:').parentElement).toHaveTextContent('2');
      expect(screen.getByText('Word Count:').parentElement).toHaveTextContent('500');
    });
  });

  // ─── Boundary Values ───────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('renders correctly with 0 counts', () => {
      const zeroReport = { ...fullReport, h1Count: 0, imagesMissingAlt: 0, wordCount: 0 };
      render(<ReportCard report={zeroReport} />);
      
      expect(screen.getByText('H1 Count:').parentElement).toHaveTextContent('0');
      expect(screen.getByText('Images Missing Alt:').parentElement).toHaveTextContent('0');
      expect(screen.getByText('Word Count:').parentElement).toHaveTextContent('0');
    });

    test('handles very long title and meta text gracefully', () => {
      const longText = 'A'.repeat(500);
      const longReport = { ...fullReport, title: longText, metaDescription: longText };
      render(<ReportCard report={longReport} />);
      
      // Ensure the long texts are actually rendered
      expect(screen.getByText(longText, { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText(longText, { selector: 'p' })).toBeInTheDocument();
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('renders fallback text when title is null or missing', () => {
      const noTitleReport = { ...fullReport, title: '' };
      render(<ReportCard report={noTitleReport} />);
      
      expect(screen.getByText('No Title Found')).toBeInTheDocument();
    });

    test('renders fallback text when metaDescription is null or missing', () => {
      const noMetaReport = { ...fullReport, metaDescription: '' };
      render(<ReportCard report={noMetaReport} />);
      
      expect(screen.getByText('No Meta Description Found')).toBeInTheDocument();
    });

    test('renders nothing or empty state when report prop is undefined', () => {
      const { container } = render(<ReportCard report={undefined} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
