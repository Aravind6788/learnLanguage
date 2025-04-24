const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const newUser = await User.create({ username, email, password, role });
    res.status(201).json({ token: generateToken(newUser), user: newUser });
  } catch (err) {
    res.status(500).json({ msg: 'Error registering user', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ msg: 'Invalid credentials' });

    res.json({ token: generateToken(user), user });
  } catch (err) {
    res.status(500).json({ msg: 'Login error', error: err.message });
  }
};
