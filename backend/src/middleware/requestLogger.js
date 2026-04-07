import logger from '../utils/logger.js';

/**
 * Request Logger Middleware - Enhanced logging for development
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.debug('Incoming Request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    headers: {
      'user-agent': req.get('user-agent'),
      'content-type': req.get('content-type')
    },
    query: req.query,
    bodySize: JSON.stringify(req.body).length
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - startTime;

    logger.debug('Response Sent', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
      responseSize: JSON.stringify(data).length
    });

    return originalJson(data);
  };

  next();
};

export default requestLogger;
