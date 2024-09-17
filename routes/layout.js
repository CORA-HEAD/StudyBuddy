const layoutController = require('../controllers/layoutController');
const express = require('express');
const router = express.Router();

router.get('/', layoutController.layout);
router.get('/about-us', layoutController.aboutus);
router.get('/contact-us', layoutController.contactus);
router.get('/terms', layoutController.terms);
router.get('/privacy', layoutController.privacy);

module.exports = router;


