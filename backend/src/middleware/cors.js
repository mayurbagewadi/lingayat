/**
 * CORS Configuration
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Number',
    'X-Page-Size'
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

export default corsConfig;
