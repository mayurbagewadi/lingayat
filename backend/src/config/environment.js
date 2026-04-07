import logger from '../utils/logger.js';

/**
 * Validate required environment variables
 */
export const validateEnvironment = () => {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASSWORD'
  ];

  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars);
    console.error(
      `❌ Missing environment variables: ${missingVars.join(', ')}\n` +
      `Please create a .env file with all required variables.\n` +
      `See .env.example for reference.`
    );
    process.exit(1);
  }

  // Validate JWT secrets length
  if (process.env.JWT_ACCESS_SECRET.length < 32) {
    logger.error('JWT_ACCESS_SECRET must be at least 32 characters');
    process.exit(1);
  }

  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    logger.error('JWT_REFRESH_SECRET must be at least 32 characters');
    process.exit(1);
  }

  logger.info('✅ Environment variables validated');
};

/**
 * Get environment info
 */
export const getEnvironmentInfo = () => {
  return {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME
    },
    apiUrl: process.env.API_BASE_URL,
    corsOrigin: process.env.CORS_ORIGIN
  };
};

export default { validateEnvironment, getEnvironmentInfo };
