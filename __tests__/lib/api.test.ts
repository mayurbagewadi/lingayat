import { apiCall, uploadPhoto, uploadPDF, refreshAccessToken } from '../../lib/api';

describe('API Utilities', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apiCall', () => {
    it('should make a fetch request with correct headers', async () => {
      const mockResponse = { success: true, data: { id: '123' } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiCall('/api/test', { token: 'test-token' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Not found' } })
      });

      await expect(apiCall('/api/test')).rejects.toThrow('Not found');
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo with correct form data', async () => {
      const mockFile = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        success: true,
        data: { fileId: 'file123', url: '/api/photo/1', uploadedAt: '2024-01-01' }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await uploadPhoto(mockFile, 1, 'test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/photo/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token', async () => {
      const mockResponse = {
        success: true,
        data: { access_token: 'new-token', expires_in: 3600 }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await refreshAccessToken('refresh-token');

      expect(result).toEqual(mockResponse.data);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/refresh',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });
});
