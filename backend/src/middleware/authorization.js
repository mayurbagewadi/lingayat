import { AuthenticationError, AuthorizationError } from './errorHandler.js';

/**
 * Role-Based Authorization Middleware
 * Checks if user has required role
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Admin Only Authorization
 */
export const adminOnly = authorize('admin');

/**
 * Subscriber Only Authorization
 * Checks if user has active subscription
 */
export const subscriberOnly = (req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (req.user.subscription_status !== 'active') {
    throw new AuthorizationError('Active subscription required');
  }

  next();
};

/**
 * Resource Owner Authorization
 * Checks if user owns the resource
 */
export const resourceOwner = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const resourceId = req.params[paramName];
    const userId = req.user.id || req.user.userId;

    if (parseInt(resourceId) !== parseInt(userId)) {
      throw new AuthorizationError('You can only access your own resources');
    }

    next();
  };
};
