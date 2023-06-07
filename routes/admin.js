const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/users/signup', userController.loadSignup);
router.post('/users/signup', userController.insertUser);

module.exports = router;
