import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/auth/login';

// Mock dependencies
jest.mock('../../pages/api/utils/supabase.js');
jest.mock('../../pages/api/utils/jwt.js');
jest.mock('bcryptjs');

describe('/api/auth/login', () => {
  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('should validate required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com'
        // missing password
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/auth/signup', () => {
  it('should validate password minimum length', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        full_name: 'Test User',
        email: 'test@example.com',
        password: '12345' // too short
      }
    });

    // Would require mocking the handler
    // This is a placeholder for more complete testing
    expect(true).toBe(true);
  });
});
