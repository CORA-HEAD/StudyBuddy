// routes/adminRouter.js
const {AuthAdmin} = require('../controllers/authController');
const admin_authenticated=require('../middlewares/admin_authenticated');
const express = require('express');
const router = express.Router();

// Render registration page
router.get('/signup', AuthAdmin.renderRegisterPage);

// Admin registration route
router.post('/signup', AuthAdmin.registerAdmin);

// Render  Admin login page
router.get('/login', AuthAdmin.renderLoginPage);

// Admin login route
router.post('/login', AuthAdmin.loginAdmin);

// Admin dashboard route
router.get('/dashboard',admin_authenticated, AuthAdmin.dashboard);

// Admin logout route
router.post('/logout', admin_authenticated,AuthAdmin.logoutAdmin);

module.exports = router;
