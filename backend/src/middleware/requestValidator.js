import Joi from 'joi';
import { ValidationError } from './errorHandler.js';
import logger from '../utils/logger.js';

/**
 * Request Validation Middleware
 * Validates request body, params, or query using Joi schema
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = getDataFromSource(req, source);

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Get all errors, not just first
        stripUnknown: true, // Remove unknown fields
        convert: true // Convert types
      });

      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));

        logger.debug('Validation failed', {
          source,
          details,
          data: dataToValidate
        });

        throw new ValidationError(
          'Validation failed',
          details
        );
      }

      // Replace request data with validated value
      replaceDataInSource(req, source, value);

      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ValidationError('Invalid request: ' + error.message);
    }
  };
};

/**
 * Helper: Get data from request by source
 */
function getDataFromSource(req, source) {
  switch (source.toLowerCase()) {
    case 'body':
      return req.body || {};
    case 'query':
      return req.query || {};
    case 'params':
      return req.params || {};
    case 'headers':
      return req.headers || {};
    default:
      return req.body || {};
  }
}

/**
 * Helper: Replace validated data back to request
 */
function replaceDataInSource(req, source, value) {
  switch (source.toLowerCase()) {
    case 'body':
      req.body = value;
      break;
    case 'query':
      req.query = value;
      break;
    case 'params':
      req.params = value;
      break;
    case 'headers':
      req.headers = value;
      break;
  }
}

/**
 * Common Joi Extensions
 */
export const customJoi = Joi.defaults((schema) => schema.required());

// Custom rules
customJoi.messages({
  'string.email': '{#label} must be a valid email address',
  'string.min': '{#label} must have at least {#limit} characters',
  'string.max': '{#label} must not exceed {#limit} characters',
  'any.required': '{#label} is required',
  'date.base': '{#label} must be a valid date'
});
