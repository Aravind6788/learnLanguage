const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');


dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes.js'));
app.use('/api/languages', require('./routes/languageRoutes.js'));
app.use('/api/users',require('./routes/userDashboardRoutes.js'));
app.use('/api/updates', userRoutes);

// Connect DB & Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error('DB Connection Error:', err));
