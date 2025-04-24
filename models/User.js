const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'learner'], default: 'learner' },
  xp:       { type: Number, default: 0 },
  level:    { type: Number, default: 1 },
  badges:   [{ title: String, dateEarned: Date }],
  progress: [
    {
      languageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
      lessonId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
      score:      Number,
      completed:  Boolean
    }
  ]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.matchPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
