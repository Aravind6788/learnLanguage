const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Language = require('../models/Language');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Create a new language
// Get a language by ID
router.get('/:id', async (req, res) => {
  try {
    const language = await Language.findById(req.params.id);
    
    if (!language) {
      return res.status(404).json({ msg: 'Language not found' });
    }

    res.json(language);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch language', error: err.message });
  }
});


router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const language = await Language.create(req.body);
    res.status(201).json(language);
  } catch (err) {
    res.status(500).json({ msg: 'Language creation failed', error: err.message });
  }
});

// Get all languages
router.get('/', async (req, res) => {
  try {
    const languages = await Language.find();
    res.json(languages);
  } catch (err) {
    res.status(500).json({ msg: 'Fetch failed', error: err.message });
  }
});

// Get all lessons for a language
router.get('/:languageId/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.find({ languageId: req.params.languageId });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch lessons for this language', error: err.message });
  }
});

module.exports = router;