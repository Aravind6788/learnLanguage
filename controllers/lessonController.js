const Lesson = require('../models/Lesson');

// Create a lesson (Admin only)
exports.createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ msg: 'Lesson creation failed', error: err.message });
  }
};

// Get all lessons
exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate('languageId');
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch lessons', error: err.message });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update lesson', error: err.message });
  }
};

// Delete a lesson
exports.deleteLesson = async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Delete failed', error: err.message });
  }
};
