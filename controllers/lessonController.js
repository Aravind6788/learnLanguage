const Lesson = require('../models/Lesson');

// Create a lesson (Admin only)
// controllers/lessonController.js
exports.createLesson = async (req, res) => {
  try {
    const { languageId, category, type, title, contents } = req.body;

    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ msg: "Lesson must include at least one content item." });
    }

    // Calculate total marks
    const totalMarks = contents.reduce((sum, item) => sum + (item.marks || 0), 0);

    const newLesson = new Lesson({
      languageId,
      category,
      type,
      title,
      contents,
      totalMarks
    });

    const savedLesson = await newLesson.save();

    res.status(201).json({
      msg: 'Lesson created successfully',
      lesson: savedLesson
    });

  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
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
