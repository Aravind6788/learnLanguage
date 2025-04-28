const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const mongoose = require('mongoose');

// 1. Create a Lesson
router.post('/', async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    return res.status(201).json({
      msg: 'Lesson created successfully',
      lesson,
    });
  } catch (err) {
    return res.status(400).json({
      msg: 'Error creating lesson',
      error: err.message,
    });
  }
});

// 2. Update Lesson Details
router.put('/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.lessonId, req.body, { new: true });
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }
    return res.json({
      msg: 'Lesson updated successfully',
      lesson,
    });
  } catch (err) {
    return res.status(400).json({
      msg: 'Error updating lesson',
      error: err.message,
    });
  }
});

// 3. Update a Specific Content Item in a Lesson
router.put('/:lessonId/content/:contentIndex', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    const content = lesson.contents[req.params.contentIndex];
    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }

    lesson.contents[req.params.contentIndex] = {
      ...content._doc,
      ...req.body,
    };

    await lesson.save();
    return res.json({
      msg: 'Content updated successfully',
      lesson,
    });
  } catch (err) {
    return res.status(400).json({
      msg: 'Error updating content',
      error: err.message,
    });
  }
});
// 4. Update Marks for a Specific User at Lesson Level
router.put('/:lessonId/user-mark', async (req, res) => {
  const { userId, obtainedMarks } = req.body;
  
  // Log the request body for debugging
  console.log('Received request body:', req.body);

  // Validate userId format and obtainedMarks
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid userId format' });
  }
  
  if (typeof obtainedMarks !== 'number' || obtainedMarks < 0 || obtainedMarks > 100) {
    return res.status(400).json({ msg: 'obtainedMarks should be a number between 0 and 100' });
  }

  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    const existing = lesson.userMarks.find(m => m.userId.toString() === userId);
    if (existing) {
      existing.obtainedMarks = obtainedMarks;
    } else {
      lesson.userMarks.push({ userId, obtainedMarks });
    }

    await lesson.save();
    return res.json({
      msg: 'User marks updated successfully',
      lesson,
    });
  } catch (err) {
    return res.status(400).json({
      msg: 'Error updating user marks',
      error: err.message,
    });
  }
});

// 4. Update Marks for a Specific User at Lesson Level
router.put('/:lessonId/user-mark', async (req, res) => {
  const { userId, obtainedMarks } = req.body;
  
  // Validate userId format and obtainedMarks
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid userId format' });
  }
  
  if (typeof obtainedMarks !== 'number') {
    return res.status(400).json({ msg: 'obtainedMarks should be a number between 0 and 100' });
  }

  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    const existing = lesson.userMarks.find(m => m.userId.toString() === userId);
    if (existing) {
      existing.obtainedMarks = obtainedMarks;
    } else {
      lesson.userMarks.push({ userId, obtainedMarks });
    }

    await lesson.save();
    return res.json({
      msg: 'User marks updated successfully',
      lesson,
    });
  } catch (err) {
    return res.status(400).json({
      msg: 'Error updating user marks',
      error: err.message,
    });
  }
});

// 5. Update Marks for a Specific User at Content Level
router.put('/:lessonId/content/:contentIndex/user-mark', async (req, res) => {
  const { userId, obtainedMarks } = req.body;
  
  // Validate userId format and obtainedMarks
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid userId format' });
  }
  
  if (typeof obtainedMarks !== 'number' || obtainedMarks < 0 || obtainedMarks > 100) {
    return res.status(400).json({ msg: 'obtainedMarks should be a number between 0 and 100' });
  }

  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    const content = lesson.contents[req.params.contentIndex];
    if (!content) {
      return res.status(404).json({ msg: 'Content not found' });
    }

    const existing = content.userMarks.find(m => m.userId.toString() === userId);
    if (existing) {
      existing.obtainedMarks = obtainedMarks;
    } else {
      content.userMarks.push({ userId, obtainedMarks });
    }

    await lesson.save();
    return res.json({
      msg: 'Content user marks updated successfully',
      lesson,
    });
  } catch (err) {
    return res.status(400).json({
      msg: 'Error updating content user marks',
      error: err.message,
    });
  }
});

// 6. Get Lesson Details by ID
router.get('/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }
    return res.json(lesson);
  } catch (err) {
    return res.status(400).json({
      msg: 'Error fetching lesson details',
      error: err.message,
    });
  }
});

module.exports = router;
