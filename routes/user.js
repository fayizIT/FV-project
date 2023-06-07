const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/signup', userController.loadSignup);
router.post('/signup', userController.insertUser);

module.exports = router;