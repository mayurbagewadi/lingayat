/**
 * Response Formatter Middleware
 * Standardizes all API responses
 */
const responseFormatter = (req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method
  res.json = function(data) {
    // If data already has success flag, return as is
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson(data);
    }

    // Format response
    const response = {
      success: true,
      data: data || null,
      timestamp: new Date().toISOString()
    };

    return originalJson(response);
  };

  next();
};

/**
 * Success Response Helper
 */
export const successResponse = (res, data, statusCode = 200, message = null) => {
  const response = {
    success: true,
    data,
    message: message || undefined,
    timestamp: new Date().toISOString()
  };

  // Remove undefined fields
  Object.keys(response).forEach(key => response[key] === undefined && delete response[key]);

  return res.status(statusCode).json(response);
};

/**
 * Paginated Response Helper
 */
export const paginatedResponse = (res, items, total, page, limit, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Created Response Helper
 */
export const createdResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

export default responseFormatter;
