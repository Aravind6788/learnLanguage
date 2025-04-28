const mongoose = require('mongoose');

const userMarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  obtainedMarks: { type: Number, default: 0 }
});

const contentSchema = new mongoose.Schema({
  text: String,
  meaning: String,
  example: String,
  audio: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  marks: { type: Number, default: 1 },
  userMarks: [userMarkSchema] // 🌟 Per-user marks for each content
});

const lessonSchema = new mongoose.Schema({
  languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Language', required: true },
  category: { type: String, enum: ['essentials'], required: true },
  type: { type: String, enum: ['word', 'sentence'], required: true },
  title: { type: String, required: true },
  contents: [contentSchema],
  totalMarks: { type: Number, default: 0 },
  userMarks: [userMarkSchema] // 🌟 Per-user total marks for the lesson
});

module.exports = mongoose.model('Lesson', lessonSchema);
