import { vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlInput from '../../../src/components/UrlInput';

describe('UrlInput Component', () => {
  let mockOnSubmit;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('enables submit button and calls onSubmit with valid URL', async () => {
      const user = userEvent.setup();
      render(<UrlInput onSubmit={mockOnSubmit} isPending={false} />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitButton = screen.getByRole('button', { name: /audit/i });

      await user.type(input, 'https://example.com');
      
      expect(submitButton).not.toBeDisabled();
      
      await user.click(submitButton);
      
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith('https://example.com');
    });
  });

  // ─── Boundary Values ───────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('disables submit button when URL is entered then cleared', async () => {
      const user = userEvent.setup();
      render(<UrlInput onSubmit={mockOnSubmit} isPending={false} />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitButton = screen.getByRole('button', { name: /audit/i });

      await user.type(input, 'https://example.com');
      expect(submitButton).not.toBeDisabled();

      await user.clear(input);
      expect(submitButton).toBeDisabled();
    });

    test('disables submit button for whitespace-only input', async () => {
      const user = userEvent.setup();
      render(<UrlInput onSubmit={mockOnSubmit} isPending={false} />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitButton = screen.getByRole('button', { name: /audit/i });

      await user.type(input, '   \t  ');
      expect(submitButton).toBeDisabled();
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('empty submit attempt is blocked (button disabled)', () => {
      render(<UrlInput onSubmit={mockOnSubmit} isPending={false} />);
      
      const submitButton = screen.getByRole('button', { name: /audit/i });
      expect(submitButton).toBeDisabled();
    });

    test('malformed URL shows inline validation error on blur or change', async () => {
      const user = userEvent.setup();
      render(<UrlInput onSubmit={mockOnSubmit} isPending={false} />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitButton = screen.getByRole('button', { name: /audit/i });

      await user.type(input, 'not-a-url');
      
      // Inline validation error should appear
      const errorMsg = await screen.findByText(/valid/i, { selector: '.error-text' });
      expect(errorMsg).toBeInTheDocument();
      
      // Submit should be blocked
      expect(submitButton).toBeDisabled();
    });

    test('rapid repeated submits are blocked while pending', async () => {
      const user = userEvent.setup();
      // Render with isPending = true
      render(<UrlInput onSubmit={mockOnSubmit} isPending={true} />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitButton = screen.getByRole('button', { name: /audit/i });

      // Even if valid URL is entered, button should be disabled when pending
      await user.type(input, 'https://example.com');
      
      expect(submitButton).toBeDisabled();
      
      // Try to click anyway (userEvent click doesn't trigger on disabled buttons, so fireEvent)
      fireEvent.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
