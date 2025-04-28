// controllers/userDashboardController.js

const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Language = require('../models/Language');
const mongoose = require('mongoose');

// Get user dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have auth middleware that sets req.user
    
    // Get user data with progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get unique languages the user is learning
    const uniqueLanguageIds = [...new Set(user.progress.map(p => p.languageId.toString()))];
    
    // Get language details
    const languages = await Language.find({ _id: { $in: uniqueLanguageIds } });
    
    // Calculate lessons completed
    const completedLessons = user.progress.filter(p => p.completed).length;
    
    // Calculate total marks
    const totalMarks = user.progress.reduce((sum, p) => sum + (p.score || 0), 0);
    
    // Calculate progress percentage for each language
    const languagesWithProgress = await Promise.all(languages.map(async (language) => {
      // Find all lessons for this language
      const totalLessonsCount = await Lesson.countDocuments({ languageId: language._id });
      
      // Find completed lessons for this language
      const userCompletedLessons = user.progress.filter(
        p => p.languageId.toString() === language._id.toString() && p.completed
      ).length;
      
      const progressPercentage = totalLessonsCount === 0 ? 
        0 : Math.round((userCompletedLessons / totalLessonsCount) * 100);
      
      return {
        id: language._id,
        name: language.name,
        code: language.code,
        progress: progressPercentage
      };
    }));
    
    return res.json({
      languagesLearning: uniqueLanguageIds.length,
      lessonsCompleted: completedLessons,
      totalMarks: totalMarks,
      xp: user.xp,
      level: user.level,
      languages: languagesWithProgress
    });
    
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user progress by language
exports.getLanguageProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { languageId } = req.params;
    
    // Validate languageId
    if (!mongoose.Types.ObjectId.isValid(languageId)) {
      return res.status(400).json({ message: 'Invalid language ID' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all lessons for this language
    const lessons = await Lesson.find({ languageId });
    
    // Group lessons by category
    const categoriesMap = {};
    
    lessons.forEach(lesson => {
      if (!categoriesMap[lesson.category]) {
        categoriesMap[lesson.category] = {
          category: lesson.category,
          total: 0,
          completed: 0,
          totalMarks: 0,
          obtainedMarks: 0
        };
      }
      
      categoriesMap[lesson.category].total += 1;
      categoriesMap[lesson.category].totalMarks += lesson.totalMarks;
      
      // Find user progress for this lesson
      const userProgress = user.progress.find(
        p => p.lessonId.toString() === lesson._id.toString()
      );
      
      if (userProgress && userProgress.completed) {
        categoriesMap[lesson.category].completed += 1;
        categoriesMap[lesson.category].obtainedMarks += userProgress.score || 0;
      }
    });
    
    const progressByCategory = Object.values(categoriesMap);
    
    return res.json({
      languageId,
      progressByCategory
    });
    
  } catch (error) {
    console.error('Error getting language progress:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user with progress
    const user = await User.findById(userId)
      .populate({
        path: 'progress.lessonId',
        select: 'title languageId'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get recent completed lessons
    const recentLessons = await Promise.all(
      user.progress
        .filter(p => p.completed)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .slice(0, 5)
        .map(async (progress) => {
          // Get language info
          const language = await Language.findById(progress.languageId);
          
          return {
            type: 'lesson',
            title: progress.lessonId ? progress.lessonId.title : 'Unknown Lesson',
            language: language ? language.name : 'Unknown Language',
            date: progress.updatedAt || progress.createdAt,
            marks: progress.score || 0
          };
        })
    );
    
    // Get recent badges
    const recentBadges = user.badges
      .sort((a, b) => new Date(b.dateEarned) - new Date(a.dateEarned))
      .slice(0, 3)
      .map(badge => ({
        type: 'badge',
        title: badge.title,
        description: badge.description || '',
        date: badge.dateEarned
      }));
    
    // Combine and sort activities
    const allActivities = [...recentLessons, ...recentBadges]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    return res.json(allActivities);
    
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user progress after completing lesson
exports.updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.params;
    const { score, completed } = req.body;
    
    // Validate lessonId
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: 'Invalid lesson ID' });
    }
    
    // Get lesson to find its language
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Update user progress
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find existing progress record
    const progressIndex = user.progress.findIndex(
      p => p.lessonId.toString() === lessonId
    );
    
    if (progressIndex === -1) {
      // Create new progress record
      user.progress.push({
        languageId: lesson.languageId,
        lessonId: lessonId,
        score: score || 0,
        completed: completed || false
      });
    } else {
      // Update existing progress record
      user.progress[progressIndex].score = score || user.progress[progressIndex].score;
      user.progress[progressIndex].completed = completed !== undefined ? 
        completed : user.progress[progressIndex].completed;
    }
    
    // Update XP if lesson was completed
    if (completed && (progressIndex === -1 || !user.progress[progressIndex].completed)) {
      // Give XP for newly completed lesson
      user.xp += 10 + (score || 0);
      
      // Update level based on XP
      user.level = Math.floor(user.xp / 100) + 1;
      
      // Check for badges
      const completedLessonsCount = user.progress.filter(p => p.completed).length + 1;
      
      // Example badge: complete 5 lessons
      if (completedLessonsCount === 5 && !user.badges.some(b => b.title === 'Novice Learner')) {
        user.badges.push({
          title: 'Novice Learner',
          description: 'Completed 5 lessons',
          dateEarned: new Date()
        });
      }
      
      // Example badge: complete 20 lessons
      if (completedLessonsCount === 20 && !user.badges.some(b => b.title === 'Dedicated Learner')) {
        user.badges.push({
          title: 'Dedicated Learner',
          description: 'Completed 20 lessons',
          dateEarned: new Date()
        });
      }
    }
    
    await user.save();
    
    return res.json({
      message: 'Progress updated successfully',
      xp: user.xp,
      level: user.level,
      newBadges: user.badges.filter(b => new Date(b.dateEarned) > new Date(Date.now() - 60000))
    });
    
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};