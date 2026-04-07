/**
 * Sentry Configuration for Error Tracking & Monitoring
 * Initializes error reporting, performance monitoring, and session tracking
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry with environment-specific configuration
 * Call this in main entry point (index.tsx) before rendering React
 */
export const initSentry = (): void => {
  const isDevelopment = import.meta.env.DEV;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string;

  // Only initialize in production or if DSN is explicitly provided
  if (!dsn) {
    if (!isDevelopment) {
      console.warn('Sentry DSN not configured. Error tracking disabled.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: isDevelopment ? 'development' : 'production',
    enabled: !isDevelopment, // Only enable in production

    // Performance monitoring
    tracesSampleRate: isDevelopment ? 1.0 : 0.1, // 10% in production

    // Session tracking
    autoSessionTracking: true,

    // Release version
    release: `lingayatsangam@${import.meta.env.VITE_APP_VERSION || '0.0.0'}`,

    // Ignore certain errors
    beforeSend(event, hint) {
      // Ignore network errors in development
      if (import.meta.env.DEV) {
        return null;
      }

      // Ignore 4xx errors (client errors)
      if (hint.originalException instanceof Error) {
        if (hint.originalException.message.includes('4')) {
          return null;
        }
      }

      return event;
    },
  });
};

/**
 * Capture a custom error message
 * Useful for logging business logic errors
 *
 * @param message - Error message
 * @param context - Additional context data
 */
export const captureError = (message: string, context?: Record<string, any>): void => {
  Sentry.captureMessage(message, 'error');
  if (context) {
    Sentry.setContext('custom', context);
  }
};

/**
 * Capture a warning message
 *
 * @param message - Warning message
 * @param context - Additional context data
 */
export const captureWarning = (message: string, context?: Record<string, any>): void => {
  Sentry.captureMessage(message, 'warning');
  if (context) {
    Sentry.setContext('custom', context);
  }
};

/**
 * Set user context for error tracking
 * Call this after user logs in
 *
 * @param userId - User ID
 * @param email - User email
 * @param username - User full name
 */
export const setUserContext = (userId: string, email?: string, username?: string): void => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

/**
 * Clear user context on logout
 */
export const clearUserContext = (): void => {
  Sentry.setUser(null);
};

export default {
  initSentry,
  captureError,
  captureWarning,
  setUserContext,
  clearUserContext,
};
