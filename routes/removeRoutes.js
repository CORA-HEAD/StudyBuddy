const express = require('express');
const router = express.Router();
const RemoveController=require('../controllers/removeController');

// Route for displaying the list of courses and the delete option
router.get('/courses',RemoveController.showCoursesToRemove);

// Route for deleting a course and its videos
router.post('/courses/:courseId',RemoveController.removeCourse);

module.exports = router;
