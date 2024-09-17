const addCartControlller=require('../controllers/addCartController');
const express = require('express');
const router = express.Router();

router.post('/',addCartControlller.itemAdd)

module.exports = router;