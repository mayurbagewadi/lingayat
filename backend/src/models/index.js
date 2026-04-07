import { Sequelize } from 'sequelize';
import dbConfig from '../config/database.js';
import logger from '../utils/logger.js';

// Initialize Sequelize
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    ssl: dbConfig.ssl
  }
);

/**
 * Import Models
 * (Models will be added as files are created)
 */

// Users Model
export const User = null; // Placeholder - will be imported
export const Photo = null;
export const PDF = null;
export const Subscription = null;
export const SubscriptionPlan = null;
export const Payment = null;
export const Interest = null;
export const ActivityLog = null;
export const Notification = null;
export const Admin = null;

/**
 * Define Model Associations
 * (Associations will be defined once models are created)
 */
const defineAssociations = () => {
  // TODO: Define associations when models are implemented
  logger.info('Model associations defined');
};

/**
 * Database Synchronization
 */
export const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;

    logger.info('Synchronizing database...');
    await sequelize.sync({ force, alter });
    logger.info('✅ Database synchronized');
  } catch (error) {
    logger.error('Database sync failed:', error);
    throw error;
  }
};

/**
 * Test Database Connection
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection successful');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export default {
  sequelize,
  User,
  Photo,
  PDF,
  Subscription,
  SubscriptionPlan,
  Payment,
  Interest,
  ActivityLog,
  Notification,
  Admin,
  defineAssociations,
  syncDatabase,
  testConnection
};
