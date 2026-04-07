/**
 * In-memory rate limiter for authentication endpoints
 * Prevents brute force attacks by limiting login/registration attempts
 *
 * Usage:
 * checkRateLimit('user@example.com')  // Check if allowed
 * resetRateLimit('user@example.com')  // Reset (after successful login)
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Store attempts by identifier (email or IP)
const loginAttempts = new Map<string, RateLimitRecord>();
const registrationAttempts = new Map<string, RateLimitRecord>();

/**
 * Check and enforce rate limit for login attempts
 *
 * @param identifier - Email, IP address, or unique identifier
 * @param maxAttempts - Maximum attempts allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns true if attempt is allowed
 * @throws Error if rate limit exceeded
 */
export const checkLoginRateLimit = (
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  // No previous attempts or time window expired
  if (!record || now > record.resetTime) {
    loginAttempts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Check if limit exceeded
  if (record.count >= maxAttempts) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000 / 60); // minutes
    throw new Error(
      `Too many login attempts. Please try again in ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.`
    );
  }

  // Increment counter
  record.count++;
  return true;
};

/**
 * Check and enforce rate limit for registration attempts
 *
 * @param identifier - Email, IP address, or unique identifier
 * @param maxAttempts - Maximum attempts allowed (default: 3)
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @returns true if attempt is allowed
 * @throws Error if rate limit exceeded
 */
export const checkRegistrationRateLimit = (
  identifier: string,
  maxAttempts: number = 3,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): boolean => {
  const now = Date.now();
  const record = registrationAttempts.get(identifier);

  // No previous attempts or time window expired
  if (!record || now > record.resetTime) {
    registrationAttempts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  // Check if limit exceeded
  if (record.count >= maxAttempts) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000 / 60); // minutes
    throw new Error(
      `Too many registration attempts. Please try again in ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.`
    );
  }

  // Increment counter
  record.count++;
  return true;
};

/**
 * Reset rate limit after successful login
 * Call this after user successfully authenticates
 *
 * @param identifier - Email, IP address, or unique identifier
 */
export const resetLoginRateLimit = (identifier: string): void => {
  loginAttempts.delete(identifier);
};

/**
 * Reset rate limit after successful registration
 * Call this after user successfully registers
 *
 * @param identifier - Email, IP address, or unique identifier
 */
export const resetRegistrationRateLimit = (identifier: string): void => {
  registrationAttempts.delete(identifier);
};

/**
 * Get current attempt count for debugging
 * (Dev/Admin only)
 *
 * @param identifier - Email, IP address, or unique identifier
 * @param type - 'login' or 'registration'
 * @returns Current attempt count or 0
 */
export const getAttemptCount = (
  identifier: string,
  type: 'login' | 'registration' = 'login'
): number => {
  const store = type === 'login' ? loginAttempts : registrationAttempts;
  const record = store.get(identifier);

  if (!record) return 0;

  // Check if window has expired
  if (Date.now() > record.resetTime) {
    store.delete(identifier);
    return 0;
  }

  return record.count;
};

/**
 * Clear all rate limit records (for testing/admin only)
 */
export const clearAllRateLimits = (): void => {
  loginAttempts.clear();
  registrationAttempts.clear();
};

/**
 * Get remaining time in seconds for identifier
 *
 * @param identifier - Email, IP address, or unique identifier
 * @param type - 'login' or 'registration'
 * @returns Remaining seconds or 0 if no limit active
 */
export const getRemainingTime = (
  identifier: string,
  type: 'login' | 'registration' = 'login'
): number => {
  const store = type === 'login' ? loginAttempts : registrationAttempts;
  const record = store.get(identifier);

  if (!record) return 0;

  const remaining = record.resetTime - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};
