/**
 * Display Sanitizer - Safe profile data display utility
 * Sanitizes profile data before rendering in components
 * Prevents XSS attacks by escaping HTML special characters
 */

import { sanitizeInput } from './sanitizer';

export interface SafeProfile {
  id: string;
  full_name: string;
  location: string;
  education: string;
  sub_caste: string;
  mobile: string;
  alt_mobile: string;
  dob: string;
  email: string;
  created_for: string;
  bio_pdf_url: string;
  status: string;
  subscription_status: string;
  [key: string]: any;
}

/**
 * Sanitize a single profile for safe display
 * Escapes all text fields to prevent XSS
 *
 * @param profile - Raw profile data from database
 * @returns Profile with sanitized text fields
 */
export const sanitizeProfileForDisplay = (profile: any): SafeProfile => {
  if (!profile) return {} as SafeProfile;

  return {
    ...profile,
    full_name: sanitizeInput(profile.full_name),
    location: sanitizeInput(profile.location),
    education: sanitizeInput(profile.education),
    sub_caste: sanitizeInput(profile.sub_caste),
    mobile: sanitizeInput(profile.mobile),
    alt_mobile: sanitizeInput(profile.alt_mobile),
    email: sanitizeInput(profile.email),
    created_for: sanitizeInput(profile.created_for),
  };
};

/**
 * Sanitize multiple profiles for safe display
 *
 * @param profiles - Array of raw profile data
 * @returns Array of sanitized profiles
 */
export const sanitizeProfilesForDisplay = (profiles: any[]): SafeProfile[] => {
  if (!Array.isArray(profiles)) return [];
  return profiles.map(profile => sanitizeProfileForDisplay(profile));
};

/**
 * Get safe text display value with fallback
 * Sanitizes and provides default if empty
 *
 * @param value - Text value to display
 * @param fallback - Default value if empty (default: 'N/A')
 * @returns Safe, sanitized text or fallback
 */
export const getSafeDisplayValue = (value: string | null | undefined, fallback = 'N/A'): string => {
  if (!value || value.trim() === '') {
    return fallback;
  }
  return sanitizeInput(value);
};

/**
 * Display truncated text safely
 * Sanitizes text and truncates to specified length
 *
 * @param text - Text to display
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Sanitized, truncated text
 */
export const getTruncatedDisplay = (
  text: string | null | undefined,
  maxLength: number = 50,
  suffix = '...'
): string => {
  const safe = getSafeDisplayValue(text);
  if (safe.length <= maxLength) return safe;
  return safe.substring(0, maxLength) + suffix;
};

export default {
  sanitizeProfileForDisplay,
  sanitizeProfilesForDisplay,
  getSafeDisplayValue,
  getTruncatedDisplay,
};
