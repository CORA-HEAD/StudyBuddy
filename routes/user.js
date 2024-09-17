const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router();


router.get('/profile', UserController.getProfile);
router.get('/logout', UserController.logout);
router.get('/profile/edit', UserController.getEditProfileForm);
router.post('/profile/edit', UserController.updateProfile);

module.exports = router;