const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const isAuthenticated = require('../middlewares/is_authenticated');

router.get('/complete', isAuthenticated,enrollmentController.createEnrollment);
router.get('/all',isAuthenticated, enrollmentController.getAllEnrollments);
// Route to delete an enrollment by ID
router.delete('/:id/delete', isAuthenticated, enrollmentController.deleteEnrollment);

module.exports = router;
