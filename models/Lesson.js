const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Language', required: true },
  category: { type: String, enum: ['essentials'], required: true },
  type: { type: String, enum: ['word', 'sentence'], required: true },

  title: { type: String, required: true },

  content: {
    text: { type: String },
    meaning: { type: String },
    example: { type: String },
    audio: { type: String }, // file path or URL
  },

  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' }
});

module.exports = mongoose.model('Lesson', lessonSchema);
