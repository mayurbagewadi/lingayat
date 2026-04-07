/**
 * Input sanitization utility using DOMPurify
 * Prevents XSS attacks by cleaning user-provided HTML/text
 *
 * Usage:
 * const clean = sanitizeInput(userInput);
 * const cleanHtml = sanitizeHtml(userHtmlString);
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize plain text input (most common case)
 * Escapes HTML special characters
 *
 * @param input - User input to sanitize
 * @returns Sanitized text safe to display
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return '';

  // Remove extra whitespace
  const trimmed = input.trim();

  // Use DOMPurify to strip all HTML tags and attributes
  const sanitized = DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: [], // No HTML tags allowed for plain text
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  return sanitized;
};

/**
 * Sanitize HTML content
 * Allows safe HTML tags but blocks script injection
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML safe to render
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return '';

  // Configure allowed tags and attributes
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };

  return DOMPurify.sanitize(html, config);
};

/**
 * Sanitize email addresses
 * Removes any dangerous characters
 *
 * @param email - Email to sanitize
 * @returns Sanitized email
 */
export const sanitizeEmail = (email: string | null | undefined): string => {
  if (!email) return '';

  // Remove whitespace and convert to lowercase
  const trimmed = email.trim().toLowerCase();

  // Remove any non-email characters
  const sanitized = trimmed.replace(/[^a-z0-9@._\-]/g, '');

  return sanitized;
};

/**
 * Sanitize URLs to prevent javascript: and data: protocols
 *
 * @param url - URL to sanitize
 * @returns Sanitized URL
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  try {
    const trimmed = url.trim();

    // Block dangerous protocols
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
      return '';
    }

    // Use URL constructor for validation
    new URL(trimmed);
    return trimmed;
  } catch {
    // Invalid URL, return empty string
    return '';
  }
};

/**
 * Sanitize file names to prevent path traversal attacks
 *
 * @param filename - File name to sanitize
 * @returns Sanitized file name
 */
export const sanitizeFilename = (filename: string | null | undefined): string => {
  if (!filename) return '';

  // Remove path separators and dangerous characters
  const sanitized = filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/[\/\\]/g, '') // Remove slashes
    .replace(/[<>:"|?*]/g, '') // Remove invalid Windows characters
    .trim();

  return sanitized || 'file';
};

/**
 * Sanitize all user-generated content in an object
 * Useful for bulk sanitization
 *
 * @param obj - Object with string values to sanitize
 * @returns Object with all strings sanitized
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key] as string);
    }
  }

  return sanitized;
};

/**
 * Check if a string contains potentially dangerous content
 * Useful for logging suspicious input
 *
 * @param input - String to check
 * @returns true if dangerous content detected
 */
export const isDangerousInput = (input: string): boolean => {
  const dangerous = [
    '<script', // Script tags
    'javascript:', // JS protocol
    'on\w+\\s*=', // Event handlers (onclick, onerror, etc)
    'data:', // Data protocol
    'vbscript:', // VB Script protocol
    'iframe', // iframes
    'object', // Object tags
    'embed', // Embed tags
  ];

  const pattern = new RegExp(dangerous.join('|'), 'gi');
  return pattern.test(input);
};

export default {
  sanitizeInput,
  sanitizeHtml,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeObject,
  isDangerousInput,
};
