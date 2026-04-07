import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import routes from './routes/index.js';

// Import middleware
import {
  errorHandler,
  corsConfig,
  rateLimiter,
  responseFormatter,
  requestLogger
} from './middleware/index.js';

// Import config
import { validateEnvironment } from './config/environment.js';
import logger from './utils/logger.js';

// Validate environment
validateEnvironment();

// Initialize Express app
const app = express();

/**
 * MIDDLEWARE SETUP - Order matters!
 */

// Security middleware
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(cors(corsConfig));

// Logging
app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }));
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Body parsing
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '50mb' }));
app.use(express.urlencoded({ limit: process.env.MAX_FILE_SIZE || '50mb', extended: true }));

// Rate limiting
app.use('/api/', rateLimiter);

// Response formatter middleware
app.use(responseFormatter);

/**
 * HEALTH CHECK ENDPOINT
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

/**
 * API ROUTES
 */
app.use('/api', routes);

/**
 * 404 HANDLER
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      details: {
        method: req.method,
        path: req.path,
        availableRoutes: '/api/docs'
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GLOBAL ERROR HANDLER (Must be last)
 */
app.use(errorHandler);

/**
 * UNHANDLED REJECTION HANDLER
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
