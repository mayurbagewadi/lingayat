import express from 'express';
import authRoutes from './auth.js';
import profileRoutes from './profile.js';
import photoRoutes from './photo.js';
import pdfRoutes from './pdf.js';
import subscriptionRoutes from './subscription.js';
import searchRoutes from './search.js';
import interestRoutes from './interest.js';
import notificationRoutes from './notification.js';
import googleDriveRoutes from './google-drive.js';
import adminRoutes from './admin.js';

const router = express.Router();

/**
 * API Routes
 * All routes prefixed with /api
 */

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (no auth required)
router.use('/auth', authRoutes);

// Profile routes (auth required)
router.use('/profile', profileRoutes);

// Photo routes (auth required)
router.use('/photo', photoRoutes);

// PDF routes (auth required)
router.use('/pdf', pdfRoutes);

// Subscription routes (auth required)
router.use('/subscription', subscriptionRoutes);

// Search routes (auth required)
router.use('/profiles', searchRoutes);

// Interest routes (auth required)
router.use('/interest', interestRoutes);

// Notification routes (auth required)
router.use('/notifications', notificationRoutes);

// Google Drive routes (auth required)
router.use('/google-drive', googleDriveRoutes);

// Admin routes (admin auth required)
router.use('/admin', adminRoutes);

export default router;
