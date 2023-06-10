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
const session = require("express-session")
const config = require("../config/config")
const userController = require('../controllers/userController');
const auth=require("../middleware/auth")

// //(it is for temp for understanding)already passing the express generator inatall generator
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

router.use(session({secret:config.sessionSecret}))

router.get('/signup', userController.loadSignup);
router.post('/signup', userController.insertUser);
router.get('/success', userController.successPage);
router.get('/login', userController.signInPage); // Add the new route for the sign-in page
router.get('/verify', userController.verifyMail);
router.get('/', userController.loadSignin);
router.get('/login', auth.isLogOut, userController.loadSignin);
router.get('/login', auth.isLogOut, userController.loadSignin);
router.get('/login', userController.loadSignin);
router.post('/login', userController.verifyLogin);
router.get('/home', auth.isLogin, userController.loadindex);
router.get('/logout',auth.isLogin,userController.userLogout)
router.get('/forget', auth.isLogOut, userController.forgetLoad);
router.post('/forget', userController.sendResetLink);


module.exports = router;
