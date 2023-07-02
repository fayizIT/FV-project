
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
router.get('/forget-password', userController.resetPassword);
router.get('/profile', auth.isLogin, userController.loadprofile);
router.get('/verification',userController.verificationLoad)
router.post('/verification', userController.sendVerificationLink)
router.get("/edit", auth.isLogin, userController.editLoad)
router.post('/edit', userController.updateProfile)
router.get('/otp-verification',  auth.isLogOut, userController.otpLoad)
router.post("/otp-verification", auth.isLogOut,userController.sendOtp);
router.post('/otp-verified', auth.otpLog, userController.verifyOtp);
router.get('/view-product',  auth.isLogin, userController.viewPage);
router.get('/cart', auth.isLogin, userController.getCart);
router.post('/addTocart',auth.isLogin,userController.addToCart);
router.post('/change-product-quantity',userController.changeQuantity)








module.exports = router;

