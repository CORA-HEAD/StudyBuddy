const {AuthUser} = require('../controllers/authController');

const passport = require('passport');
const express = require('express');
const router = express.Router();

router.get('/signup', AuthUser.showSignupForm);
router.post('/signup', AuthUser.signup);
router.get('/verify',AuthUser.showVerifyPage);
router.post('/verify',AuthUser.verify);
router.get('/login', AuthUser.showLoginForm);
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/auth/login',
    failureFlash: true
}), AuthUser.login);
// router.get('/verifySms',AuthUser.showSmsVerifyPage); //for not use sms temp
// router.post('/verifySms',AuthUser.verifySms); //for not use sms temp

// Show forgot password form
router.get('/forgotPassword',AuthUser.showForgotPasswordForm);

// Handle forgot password request
router.post('/forgotPassword', AuthUser.requestPasswordReset);

// Show reset password form
router.get('/resetPassword/:token', AuthUser.showResetPasswordForm);

// Handle reset password submission
router.post('/resetPassword/:token',AuthUser.resetPassword);

module.exports = router;