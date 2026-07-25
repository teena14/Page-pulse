import { vi } from 'vitest';
import axios from 'axios';
import { auditUrl } from '../../../src/services/apiService';

vi.mock('axios', () => {
  const mockAxios = { post: vi.fn(), create: vi.fn(() => mockAxios) };
  return { default: mockAxios };
});

// ─── Shared fixtures ───────────────────────────────────────────────────────────

const fullSuccessResponse = {
  data: {
    success: true,
    data: {
      url: 'https://example.com',
      httpStatus: 200,
      responseTime: 243,
      title: 'Example Domain',
      metaDescription: 'This is a full example page for testing.',
      h1Count: 1,
      imagesMissingAlt: 2,
      wordCount: 116,
    },
    timestamp: '2026-07-25T10:00:00.000Z',
  },
};

const emptyDataResponse = {
  data: {
    success: true,
    data: {
      url: 'https://example.com',
      httpStatus: 200,
      responseTime: 5,
      title: '',
      metaDescription: '',
      h1Count: 0,
      imagesMissingAlt: 0,
      wordCount: 0,
    },
    timestamp: '2026-07-25T10:00:00.000Z',
  },
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('auditUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Happy Path ──────────────────────────────────────────────────────────────

  describe('Happy Path', () => {
    test('calls POST /api/v1/audit with the correct URL and returns parsed data', async () => {
      axios.post.mockResolvedValue(fullSuccessResponse);

      const result = await auditUrl('https://example.com');

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/audit'),
        { url: 'https://example.com' },
        expect.any(Object)
      );
      expect(result).toEqual(fullSuccessResponse.data);
    });

    test('returned object contains success, data, and timestamp fields', async () => {
      axios.post.mockResolvedValue(fullSuccessResponse);

      const result = await auditUrl('https://example.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });

    test('returned data object contains all API contract fields', async () => {
      axios.post.mockResolvedValue(fullSuccessResponse);

      const result = await auditUrl('https://example.com');

      const requiredFields = [
        'url', 'httpStatus', 'responseTime', 'title',
        'metaDescription', 'h1Count', 'imagesMissingAlt', 'wordCount',
      ];
      requiredFields.forEach((field) => expect(result.data).toHaveProperty(field));
    });
  });

  // ─── Boundary Values ─────────────────────────────────────────────────────────

  describe('Boundary Values', () => {
    test('returns correctly when data fields are all empty/zero', async () => {
      axios.post.mockResolvedValue(emptyDataResponse);

      const result = await auditUrl('https://example.com');

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('');
      expect(result.data.h1Count).toBe(0);
      expect(result.data.wordCount).toBe(0);
    });

    test('handles a slow (but successful) response without throwing', async () => {
      axios.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(fullSuccessResponse), 50))
      );

      const result = await auditUrl('https://slow.com');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  // ─── Failure Modes ───────────────────────────────────────────────────────────

  describe('Failure Modes', () => {
    test('throws with UPSTREAM_ERROR code when the backend is unreachable (network error)', async () => {
      const networkErr = new Error('Network Error');
      networkErr.code = 'ERR_NETWORK';
      axios.post.mockRejectedValue(networkErr);

      await expect(auditUrl('https://example.com')).rejects.toMatchObject({
        code: 'UPSTREAM_ERROR',
      });
    });

    test('throws with the backend error code when backend returns a structured error JSON', async () => {
      // Axios rejects with an error that has a response attached for 4xx/5xx
      const axiosErr = new Error('Request failed with status code 408');
      axiosErr.response = {
        status: 408,
        data: {
          success: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'The target website took too long to respond.',
          },
        },
      };
      axios.post.mockRejectedValue(axiosErr);

      await expect(auditUrl('https://example.com')).rejects.toMatchObject({
        code: 'REQUEST_TIMEOUT',
        message: 'The target website took too long to respond.',
      });
    });

    test('throws with INTERNAL_SERVER_ERROR when backend response shape is unexpected/malformed', async () => {
      // Backend responded 200 but with a non-standard body
      axios.post.mockResolvedValue({ data: { unexpectedKey: true } });

      await expect(auditUrl('https://example.com')).rejects.toMatchObject({
        code: 'INTERNAL_SERVER_ERROR',
      });
    });
  });
});
