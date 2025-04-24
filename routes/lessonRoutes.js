const express = require('express');
const router = express.Router();
const {
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');

const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Public: view lessons
router.get('/', getLessons);

// Admin only
router.post('/', protect, isAdmin, createLesson);
router.put('/:id', protect, isAdmin, updateLesson);
router.delete('/:id', protect, isAdmin, deleteLesson);

module.exports = router;
