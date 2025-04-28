
// routes/userDashboardRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/userDashboardController');

// Get dashboard stats
router.get('/dashboard/stats', protect, dashboardController.getDashboardStats);

// Get language progress
router.get('/language-progress/:languageId', protect, dashboardController.getLanguageProgress);

// Get recent activity
router.get('/dashboard/activity', protect, dashboardController.getRecentActivity);

// Update lesson progress
router.put('/lesson-progress/:lessonId', protect, dashboardController.updateLessonProgress);

module.exports = router;

// routes/index.js (or app.js) - Add these lines to your main router file
// const userDashboardRoutes = require('./routes/userDashboardRoutes');
// app.use('/api/users', userDashboardRoutes);