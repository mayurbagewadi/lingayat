# Backend Project Structure

```
backend/
├── src/
│   ├── app.js                          # Express app initialization
│   ├── server.js                       # Server entry point
│   │
│   ├── config/                         # Configuration files
│   │   ├── database.js                 # PostgreSQL connection
│   │   ├── google-drive.js             # Google Drive API config
│   │   ├── razorpay.js                 # Razorpay config
│   │   ├── email.js                    # Email service config
│   │   ├── constants.js                # App constants
│   │   └── environment.js              # Environment validation
│   │
│   ├── models/                         # Sequelize models (ORM)
│   │   ├── index.js                    # Model exports
│   │   ├── User.js
│   │   ├── Photo.js
│   │   ├── PDF.js
│   │   ├── Subscription.js
│   │   ├── Payment.js
│   │   ├── Interest.js
│   │   ├── ActivityLog.js
│   │   ├── Notification.js
│   │   ├── SubscriptionPlan.js
│   │   ├── Admin.js
│   │   └── associations.js             # Model relationships
│   │
│   ├── routes/                         # API route definitions
│   │   ├── index.js                    # Main router
│   │   ├── auth.js                     # Auth routes
│   │   ├── profile.js                  # Profile routes
│   │   ├── photo.js                    # Photo routes
│   │   ├── pdf.js                      # PDF routes
│   │   ├── subscription.js             # Subscription routes
│   │   ├── search.js                   # Search routes
│   │   ├── interest.js                 # Interest routes
│   │   ├── notification.js             # Notification routes
│   │   ├── google-drive.js             # Google Drive routes
│   │   └── admin.js                    # Admin routes
│   │
│   ├── controllers/                    # Business logic handlers
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── photoController.js
│   │   ├── pdfController.js
│   │   ├── subscriptionController.js
│   │   ├── searchController.js
│   │   ├── interestController.js
│   │   ├── notificationController.js
│   │   ├── googleDriveController.js
│   │   └── adminController.js
│   │
│   ├── services/                       # Business logic services
│   │   ├── authService.js              # Auth logic
│   │   ├── profileService.js
│   │   ├── photoService.js
│   │   ├── pdfService.js
│   │   ├── subscriptionService.js
│   │   ├── googleDriveService.js       # Google Drive API calls
│   │   ├── razorpayService.js          # Razorpay integration
│   │   ├── emailService.js             # Email sending
│   │   ├── notificationService.js
│   │   ├── searchService.js
│   │   └── tokenService.js             # JWT token management
│   │
│   ├── middleware/                     # Express middleware
│   │   ├── auth.js                     # JWT verification
│   │   ├── authorization.js            # Role-based access
│   │   ├── errorHandler.js             # Global error handling
│   │   ├── requestValidator.js         # Input validation (Joi)
│   │   ├── rateLimiter.js              # Rate limiting
│   │   ├── requestLogger.js            # Request logging
│   │   ├── cors.js                     # CORS configuration
│   │   └── responseFormatter.js        # Standard response format
│   │
│   ├── utils/                          # Utility functions
│   │   ├── constants.js                # App constants
│   │   ├── validators.js               # Custom validators
│   │   ├── helpers.js                  # Helper functions
│   │   ├── errors.js                   # Custom error classes
│   │   ├── logger.js                   # Winston logger setup
│   │   ├── encryption.js               # Data encryption/decryption
│   │   ├── mailer.js                   # Email utilities
│   │   ├── jwt.js                      # JWT utilities
│   │   └── file-upload.js              # File upload utilities
│   │
│   ├── migrations/                     # Database migrations
│   │   ├── run.js                      # Migration runner
│   │   ├── seed.js                     # Seeder runner
│   │   ├── [timestamp]_initial_schema.js
│   │   └── [timestamp]_add_index.js
│   │
│   ├── seeds/                          # Test data seeders
│   │   ├── users.js
│   │   ├── subscriptions.js
│   │   └── subscription_plans.js
│   │
│   ├── validators/                     # Request validation schemas
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── photo.js
│   │   ├── pdf.js
│   │   ├── subscription.js
│   │   ├── search.js
│   │   └── interest.js
│   │
│   ├── templates/                      # Email templates
│   │   ├── welcome.html
│   │   ├── password-reset.html
│   │   ├── profile-approved.html
│   │   ├── pdf-approved.html
│   │   ├── pdf-rejected.html
│   │   ├── interest-notification.html
│   │   ├── payment-confirmed.html
│   │   └── subscription-expiry.html
│   │
│   └── cron/                           # Scheduled jobs
│       ├── jobs.js                     # Cron job definitions
│       ├── subscriptionExpiry.js       # Auto-expire subscriptions
│       ├── notificationDigest.js       # Daily digest emails
│       ├── backupDatabase.js           # Daily backups
│       └── cleanupTemp.js              # Cleanup temp files
│
├── tests/                              # Test files
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── models/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── photo.test.js
│   │   ├── subscription.test.js
│   │   └── google-drive.test.js
│   ├── fixtures/
│   │   ├── users.json
│   │   ├── photos.json
│   │   └── payments.json
│   └── setup.js                        # Test configuration
│
├── scripts/
│   ├── seedTestData.js                 # Generate test data
│   ├── generateJWT.js                  # Generate test JWT
│   └── manualBackup.js                 # Manual database backup
│
├── logs/
│   ├── app.log
│   ├── error.log
│   └── access.log
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .dockerignore
│
├── .env.example                        # Environment variables template
├── .env.local                          # Local development (git ignored)
├── .env.test                           # Test environment
├── .env.production                     # Production (git ignored)
│
├── .eslintrc.json                      # ESLint configuration
├── .prettierrc                         # Code formatter config
├── .gitignore
├── README.md
├── SETUP.md                            # Setup instructions
├── package.json
├── package-lock.json
└── jest.config.js                      # Jest test configuration
```

## Key Files Explained

### Entry Points
- `src/server.js` - Main entry point (starts Express server)
- `src/app.js` - Express app configuration (middleware, routes)

### Database
- `src/models/` - ORM models (Sequelize)
- `src/migrations/` - Database schema migrations
- `src/seeds/` - Test data seeders

### API Logic
- `src/routes/` - URL route definitions
- `src/controllers/` - Request handlers
- `src/services/` - Business logic (reusable)

### Infrastructure
- `src/middleware/` - Express middleware (auth, validation, errors)
- `src/utils/` - Utility functions
- `src/config/` - App configuration

### Testing & Scripts
- `tests/` - Automated tests (unit + integration)
- `scripts/` - Manual scripts (seeding, backups)

## Initialization Order

1. Load environment variables (`.env`)
2. Initialize database connection (Sequelize)
3. Define models & associations
4. Setup middleware (CORS, rate limiting, auth)
5. Register routes
6. Start cron jobs
7. Start Express server

## File Size Guidelines

| Directory | Target Size | Max |
|-----------|------------|-----|
| controllers | 200 lines max per file | 300 |
| services | 300 lines max per file | 500 |
| models | 150 lines max per file | 250 |
| routes | 100 lines max per file | 150 |
| middleware | 100 lines max per file | 150 |
| utils | 200 lines max per file | 300 |

## Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files | kebab-case | `user-service.js` |
| Folders | kebab-case | `src/models` |
| Classes | PascalCase | `class UserService` |
| Functions | camelCase | `function getUserById()` |
| Constants | UPPER_SNAKE_CASE | `const MAX_FILE_SIZE` |
| Database | snake_case | `subscription_plans` |

## Import/Export Pattern

```javascript
// Services
export class UserService { ... }
export default UserService;

// Models
export const User = sequelize.define(...);

// Utils
export const validateEmail = (email) => { ... };

// Controllers
export const getProfile = async (req, res) => { ... };
```

## Error Handling

```
Custom Errors:
├── ValidationError (400)
├── AuthenticationError (401)
├── AuthorizationError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── BusinessLogicError (422)
└── ServerError (500)

All passed to global error handler middleware
```
