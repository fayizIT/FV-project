
const express = require('express');
const router = express.Router();
const config = require("../config/config")
const userController = require('../controllers/userController');
const auth = require("../middleware/auth");

const multer = require('multer')
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/userImage'))
    },
    filename: (req, file, cb) => {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name)
    }
  })

const userUpload = multer ({storage: storage})
// // //(it is for temp for understanding)already passing the express generator inatall generator



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
router.post('/edit',userUpload.single('image'),userController.editLoad);
router.get('/verification',userController.verificationLoad)




router.get("/address", auth.isLogin, userController.loadAddress);
router.post("/address", userController.addressList);
// router.post("/add-new-address", userControllers.addNewAddress);
router.get("/delete-address", auth.isLogin, userController.deletingAddress);
router.post("/edit-address", userController.editAddress);
router.post("/set-as-default", userController.settingAsDefault);
router.post("/change-address", userController.changeAddress);

router.post('/verification', userController.sendVerificationLink)
router.get('/otp-verification',  auth.isLogOut, userController.otpLoad)
router.post("/otp-verification", auth.isLogOut,userController.sendOtp);
router.post('/otp-verified', auth.otpLog, userController.verifyOtp);

router.get('/view-product',  auth.isLogin, userController.viewPage);
router.get('/cart', auth.isLogin, userController.getCart);
router.post('/addTocart',auth.isLogin,userController.addToCart);
router.post('/change-product-quantity',userController.changeQuantity);


router.get("/checkout", auth.isLogin, userController.checkoutLoad);


router.get('/orderFailed',auth.isLogin,userController.orderFailed)






router.post("/submit-checkout",auth.isLogin, userController.submitCheckout);
router.get("/my-orders", auth.isLogin, userController.loadOrders);
router.get('/viewOrder',auth.isLogin,userController.loadingOrdersViews)

















module.exports = router;

