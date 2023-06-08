// const express = require('express');
// const router = express.Router();
// const userController = require('../controllers/userController');

// //(it is for temp for understanding)already passing the express generator inatall generator

// const bodyParser = require("body-parser");
// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));

// router.get('/signup', userController.loadSignup);
// router.post('/signup', userController.insertUser);
// router.get('/success', userController.successPage);

// module.exports = router;


const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// //(it is for temp for understanding)already passing the express generator inatall generator
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/signup', userController.loadSignup);
router.post('/signup', userController.insertUser);
router.get('/success', userController.successPage);
router.get('/signin', userController.signInPage); // Add the new route for the sign-in page
router.get('/verify', userController.verifyMail);

module.exports = router;
