import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errorHandler.js';
import logger from '../utils/logger.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user to request
    req.user = decoded;
    req.userId = decoded.userId;

    logger.debug('User authenticated', { userId: decoded.userId });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }

    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }

    throw new AuthenticationError('Authentication failed');
  }
};

/**
 * Optional Auth Middleware
 * Authenticates if token provided, but doesn't fail if not
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      req.userId = decoded.userId;
    }
  } catch (error) {
    logger.debug('Optional auth failed (allowed to continue)', { error: error.message });
  }

  next();
};

export default authMiddleware;
