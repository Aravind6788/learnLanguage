const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if needed

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user (without manual hashing)
    const newUser = await User.create({ 
      username, 
      email, 
      password, // plain password
      role 
    });

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({ 
      token, 
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Send token and user data
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Login error', error: err.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'learner' }); // Fetch users with the role 'learner'

    if (users.length === 0) {
      return res.status(404).json({ msg: 'No learners found' });
    }

    res.json(users); // Return the list of learners
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error fetching users', error: err.message });
  }
};
