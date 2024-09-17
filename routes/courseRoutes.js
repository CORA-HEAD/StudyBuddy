const courseController=require('../controllers/courseController');
const express = require('express');
const router = express.Router();
router.get('/:course_id',courseController.course);
module.exports = router;
