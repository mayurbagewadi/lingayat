# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

## Test Structure

Tests are organized in the `__tests__` directory mirroring the source structure:

```
__tests__/
├── api/          # API endpoint tests
├── lib/          # Utility function tests
└── components/   # Component tests
```

## Writing Tests

### API Tests

Test files should mock Supabase, JWT utilities, and external dependencies:

```javascript
jest.mock('../../pages/api/utils/supabase.js');
jest.mock('../../pages/api/utils/jwt.js');

describe('/api/endpoint', () => {
  it('should handle success', async () => {
    // Test implementation
  });
});
```

### Component Tests

Use React Testing Library for component testing:

```typescript
import { render, screen } from '@testing-library/react';
import Component from '../../components/Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });
});
```

## Coverage Goals

- **Lines**: 50%+
- **Branches**: 50%+
- **Functions**: 50%+
- **Statements**: 50%+

## Critical Paths to Test

1. **Authentication**
   - Login with valid credentials
   - Signup validation
   - Token refresh
   - Permission checks

2. **Photo Upload**
   - File validation
   - Upload to Google Drive
   - Database storage
   - Error handling

3. **Payments**
   - Order creation
   - Payment verification
   - Subscription activation
   - Error handling

4. **Search & Filtering**
   - Profile search
   - Pagination
   - Subscription verification
   - Result accuracy

5. **Admin Functions**
   - Permission checks
   - PDF approval
   - User management
   - Payment viewing

## Continuous Integration

Tests run on:
- Push to any branch
- Pull requests
- Pre-deployment validation

Failures block merge/deployment.

## Debugging Tests

```bash
# Run specific test file
npm test -- __tests__/lib/api.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="uploadPhoto"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Mocking Strategy

### Supabase Mocks
```javascript
const { supabaseAdmin } = require('../../pages/api/utils/supabase.js');

supabaseAdmin.from.mockReturnValue({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: mockData })
    })
  })
});
```

### External APIs
- Razorpay: Mock order creation and verification
- Google Drive: Mock file upload responses
- Email service: Mock send operations

## Performance Testing

Monitor:
- API response times (target: <500ms)
- Database query performance
- File upload speed
- Search query latency

## Test Maintenance

- Update tests when requirements change
- Remove obsolete test cases
- Keep test data realistic
- Document complex test scenarios
