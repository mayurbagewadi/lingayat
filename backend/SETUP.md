# Backend Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 13
- Git

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Setup Database
```bash
# Create database
createdb lingayat_matrimonial

# Run migrations
npm run db:migrate

# Seed test data (optional)
npm run seed:data
```

### 4. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Full Setup Guide

### Step 1: Environment Setup

#### Create .env file
```bash
cp .env.example .env
```

#### Configure required variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lingayat_matrimonial
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=generate_32_char_random_string_here
JWT_REFRESH_SECRET=generate_32_char_random_string_here

# Google Drive
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Step 2: Database Setup

#### Create PostgreSQL Database
```bash
createdb lingayat_matrimonial
```

#### Run Schema (if not using migrations)
```bash
psql -U postgres -d lingayat_matrimonial -f DATABASE_SCHEMA.sql
```

#### Run Migrations
```bash
npm run db:migrate
```

#### Seed Sample Data (optional)
```bash
npm run db:seed
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Development Server
```bash
npm run dev
```

Expected output:
```
🚀 Server running in development mode on port 3000
📖 API Documentation: http://localhost:3000/api/docs
❤️  Health Check: http://localhost:3000/health
```

---

## Docker Setup

### Build & Run with Docker Compose
```bash
docker-compose up --build
```

This starts:
- PostgreSQL database
- Node.js API server
- pgAdmin (optional, port 5050)

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f api
docker-compose logs -f postgres
```

---

## Development Commands

### Start Development Server
```bash
npm run dev
```
Auto-reloads on file changes

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### Linting
```bash
npm run lint
```

### Database Operations
```bash
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data
npm run seed:data    # Generate test data
```

---

## Project Structure

```
backend/
├── src/
│   ├── app.js          # Express app config
│   ├── server.js       # Server entry point
│   ├── config/         # Configuration
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── controllers/    # Business logic
│   ├── services/       # Services
│   ├── middleware/     # Middleware
│   ├── utils/          # Utilities
│   └── validators/     # Input validators
├── tests/              # Test files
├── logs/               # Log files
├── docker-compose.yml  # Docker setup
├── .env.example        # Environment template
└── package.json        # Dependencies
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/profile/me` | Get my profile |
| POST | `/api/photo/upload` | Upload photo |
| GET | `/api/pdf/:userId` | Get PDF (subscribers) |

For full API documentation, see `../API_SPECIFICATION.md`

---

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres -d postgres -c "SELECT version();"

# Verify connection string in .env
# DB_HOST should be localhost (or docker container name if using Docker)
```

### Port 3000 Already in Use
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### JWT Secret Too Short
```
JWT_ACCESS_SECRET must be at least 32 characters
Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Google Drive Connection Issues
```
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Verify OAuth credentials at: https://console.cloud.google.com
- Ensure redirect URI matches: GOOGLE_REDIRECT_URI
```

### Email Service Issues
```
- Use app-specific password (not regular Gmail password)
- Enable "Less secure app access" if using Gmail
- Check SMTP_HOST, SMTP_USER, SMTP_PASSWORD
```

---

## Environment Profiles

### Development (.env)
```
NODE_ENV=development
LOG_LEVEL=debug
```

### Testing (.env.test)
```
NODE_ENV=test
DB_NAME=lingayat_matrimonial_test
LOG_LEVEL=error
```

### Production (.env.production)
```
NODE_ENV=production
LOG_LEVEL=warn
DB_SSL=true
```

---

## Production Deployment

### Pre-deployment Checklist
- [ ] All environment variables set
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Logging setup
- [ ] Rate limiting configured
- [ ] CORS origins set correctly

### Deploy with Docker
```bash
docker build -t matrimonial-api:1.0.0 .
docker run -d --env-file .env.production matrimonial-api:1.0.0
```

### Health Check
```bash
curl -I http://localhost:3000/health
```

---

## Support

For issues or questions:
1. Check logs: `logs/app.log` or `logs/error.log`
2. Enable debug mode: `LOG_LEVEL=debug`
3. Check API_SPECIFICATION.md for endpoint details
4. Review SYSTEM_ARCHITECTURE.md for architecture

---

**Status:** ✅ Backend ready to code
**Last Updated:** 2026-04-06
