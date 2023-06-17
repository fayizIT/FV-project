
// const express = require('express');
// const router = express.Router();
// const config = require("../config/config")
// const userController = require('../controllers/userController');

// const session = require("express-session")


// // //(it is for temp for understanding)already passing the express generator inatall generator
// const bodyParser = require('body-parser');

// router.use(session({secret:config.sessionSecret}))
// const auth=require("../middleware/auth")

// router.use(bodyParser.urlencoded({ extended: true }));



// router.get('/signup', auth.isLogOut,userController.loadSignup);
// router.post('/signup', userController.insertUser);
// router.get('/success', userController.successPage);
// router.get('/login', userController.signInPage); // Add the new route for the sign-in page
// router.get('/verify', userController.verifyMail);
// router.get('/',auth.isLogOut,userController.loadSignin);
// router.get('/login', auth.isLogOut, userController.loadSignin);
// router.get('/login', userController.loadSignin);
// router.post('/login', userController.verifyLogin);
// router.get('/home', auth.isLogin, userController.loadindex);
// router.get('/logout',auth.isLogin,userController.userLogout)
// router.get('/forget', auth.isLogOut, userController.forgetLoad);
// router.post('/forget', userController.sendResetLink);


// module.exports = router;


const express = require('express');
const router = express.Router();
const config = require("../config/config")
const userController = require('../controllers/userController');
const auth = require("../middleware/auth");
// // //(it is for temp for understanding)already passing the express generator inatall generator
const bodyParser = require('body-parser');


router.get('/signup', auth.isLogOut, userController.loadSignup);
router.post('/signup', userController.insertUser);
router.get('/success', auth.isLogOut, userController.successPage);
router.get('/verify', userController.verifyMail);
router.get('/', auth.isLogOut, userController.loadlogin);
router.get('/login', auth.isLogOut, userController.loadlogin);
router.post('/login', userController.verifyLogin);
router.get('/home', auth.isLogin, userController.loadindex);
router.get('/logout', auth.isLogin, userController.userLogout);
router.get('/forget', auth.isLogOut, userController.forgetLoad);
router.post('/forget', userController.sendResetLink);
router.get('/forget-password',  auth.isLogOut, userController.forgetPasswordLoad)

router.post('/forget-password', userController.resetPassword)
router.get('/profile', auth.isLogin, userController.loadprofile);

router.get('/verification',userController.verificationLoad)
router.post('/verification', userController.sendVerificationLink)
router.get("/edit", auth.isLogin, userController.editLoad)
router.post('/edit', userController.updateProfile)



module.exports = router;

