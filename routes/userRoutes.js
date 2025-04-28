const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Add a language to user's progress
router.post('/:userId/add-language', async (req, res) => {
  try {
    const { languageId } = req.body;
    console.log(req.body);
    const { userId } = req.params;

    if (!languageId) {
      return res.status(400).json({ message: 'Language ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the language is already added
    const languageExists = user.progress.some(p => p.languageId.toString() === languageId);
    if (languageExists) {
      return res.status(400).json({ message: 'Language already added.' });
    }

    user.progress.push({ languageId });
    await user.save();

    res.status(200).json({ message: 'Language added successfully.', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
