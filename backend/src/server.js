import app from './app.js';
import { sequelize } from './models/index.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Test database connection
    logger.info('Testing database connection...');
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    // Sync database models (use migrations in production)
    if (NODE_ENV === 'development') {
      logger.info('Syncing database models...');
      await sequelize.sync({ alter: false }); // Use migrations in production!
      logger.info('Database models synced');
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(
        `🚀 Server running in ${NODE_ENV} mode on port ${PORT}`
      );
      logger.info(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        sequelize.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        sequelize.close();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
