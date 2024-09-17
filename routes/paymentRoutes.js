const express = require('express');
const router = express.Router();
const paymentController=require('../controllers/paymentController');

// View cart page
router.get('/view',paymentController.view);

// Handle course removal from the cart
router.post('/remove',paymentController.remove);


router.post('/payment',paymentController.payment);


router.get('/success', paymentController.success);

router.get('/cancel', paymentController.cancel);

module.exports = router;