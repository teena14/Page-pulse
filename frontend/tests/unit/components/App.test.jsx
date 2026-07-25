import { vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../src/App';
import * as apiService from '../../../src/services/apiService';

// Mock the API service
vi.mock('../../../src/services/apiService', () => ({
  auditUrl: vi.fn(),
}));

describe('App Component', () => {
  const mockReport = {
    url: 'https://example.com',
    httpStatus: 200,
    responseTime: 100,
    title: 'Test Title',
    metaDescription: 'Test Meta',
    h1Count: 1,
    imagesMissingAlt: 0,
    wordCount: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('loading -> success transition renders ReportCard', async () => {
      const user = userEvent.setup();
      
      let resolveApi;
      apiService.auditUrl.mockReturnValue(new Promise((resolve) => {
        resolveApi = resolve;
      }));

      render(<App />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitBtn = screen.getByRole('button', { name: /audit/i });

      // Ensure report is not rendered initially
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();

      await user.type(input, 'https://example.com');
      await user.click(submitBtn);

      // Verify pending state (loading text on button)
      expect(submitBtn).toHaveTextContent(/auditing/i);

      // Resolve the API call wrapped in act
      await act(async () => {
        resolveApi({ success: true, data: mockReport });
      });

      // Verify success transition
      await waitFor(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument();
      });
      
      // Button should be back to normal
      expect(submitBtn).toHaveTextContent(/audit page/i);
    });
  });

  // ─── Boundary Values ───────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('rapid consecutive submits are ignored while loading', async () => {
      const user = userEvent.setup();
      
      // Return a pending promise so it stays in loading state
      let resolveApi;
      const apiPromise = new Promise((resolve) => {
        resolveApi = resolve;
      });
      apiService.auditUrl.mockReturnValue(apiPromise);

      render(<App />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitBtn = screen.getByRole('button', { name: /audit/i });

      await user.type(input, 'https://example.com');
      
      // First click
      await user.click(submitBtn);
      
      expect(apiService.auditUrl).toHaveBeenCalledTimes(1);

      // Submit button should now be disabled
      expect(submitBtn).toBeDisabled();

      // Second click (bypassing the disabled guard just in case)
      submitBtn.click();
      
      expect(apiService.auditUrl).toHaveBeenCalledTimes(1); // Still 1

      // Clean up the promise
      await act(async () => {
        resolveApi({ success: true, data: mockReport });
      });
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('loading -> error transition renders correct error message', async () => {
      const user = userEvent.setup();
      const mockError = new Error('The target website took too long to respond.');
      mockError.code = 'REQUEST_TIMEOUT';
      apiService.auditUrl.mockRejectedValue(mockError);

      render(<App />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitBtn = screen.getByRole('button', { name: /audit/i });

      await user.type(input, 'https://timeout.com');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('The target website took too long to respond.')).toBeInTheDocument();
      });
    });

    test('error state clears on new valid submit', async () => {
      const user = userEvent.setup();
      
      // First call fails
      const mockError = new Error('Failure 1');
      mockError.code = 'UPSTREAM_ERROR';
      
      apiService.auditUrl
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ success: true, data: mockReport });

      render(<App />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitBtn = screen.getByRole('button', { name: /audit/i });

      // Trigger error
      await user.type(input, 'https://fail.com');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Failure 1')).toBeInTheDocument();
      });

      // New valid submit
      await user.clear(input);
      await user.type(input, 'https://example.com');
      await user.click(submitBtn);

      // Error should be cleared immediately upon submit (or on success)
      await waitFor(() => {
        expect(screen.queryByText('Failure 1')).not.toBeInTheDocument();
      });
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    test('component unmounts mid-request without crashing', async () => {
      const user = userEvent.setup();
      
      let resolveApi;
      const apiPromise = new Promise((resolve) => {
        resolveApi = resolve;
      });
      apiService.auditUrl.mockReturnValue(apiPromise);

      const { unmount } = render(<App />);

      const input = screen.getByRole('textbox', { name: /url/i });
      const submitBtn = screen.getByRole('button', { name: /audit/i });

      await user.type(input, 'https://example.com');
      await user.click(submitBtn);

      // Unmount before the promise resolves
      unmount();
      
      // Resolve the promise, should not throw or warn about unmounted state updates
      await act(async () => {
        resolveApi({ success: true, data: mockReport });
      });
      
      // Just waiting a tick to ensure no unhandled promise rejections
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });
});
