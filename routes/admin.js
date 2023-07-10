var express = require("express");
var session = require("express-session");
const adminAuth = require("../middleware/adminAuth");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {cb(null, path.join(__dirname, "../public/uploads"));},
  filename: function (req, file, cb) {cb(null, Date.now() + "-" + file.originalname);},});
const uploads = multer({ storage: storage });





// router.use(session({ secret: config.sessionSecret }));

var router = express.Router();
var config = require("../config/config");
var bodyParser = require("body-parser");
var adminController = require("../controllers/adminController");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.get("/", adminAuth.islogOut,adminController.loginLoad);
router.post("/", adminAuth.islogOut,adminController.loginVerify);
router.get("/home", adminAuth.isLogin,adminController.loadDash);
router.get("/logout", adminAuth.isLogin, adminController.adminlogout);
router.get("/add-products", adminAuth.isLogin, adminController.loadProducts);
router.post("/add-products",uploads.array("image",4),adminController.insertProducts);
router.get("/category", adminAuth.isLogin, adminController.loadCategory);
router.post("/category", adminController.addCategory);
router.get("/users", adminAuth.isLogin, adminController.addUsers);
router.get("/edit-user", adminAuth.isLogin, adminController.editUser);
router.post("/edit-user", adminAuth.isLogin,adminController.updateUser);
router.get("/block",adminAuth.isLogin,adminController.blockUser)
router.get("/unblock", adminAuth.isLogin, adminController.unblockUser);


// router.get("/edit-product", adminAuth.isLogin, adminController.EditProduct);
// router.post("/edit-product", adminAuth.isLogin, adminController.updateProduct);


router.get("/edit-product", adminController.EditProduct);
router.post("/edit-products",uploads.array("image",4),adminController.updateProduct);

router.get("/unlist-products",adminAuth.isLogin,adminController.unlistProducts);
router.get("/list-products", adminAuth.isLogin, adminController.listProducts);


router.get("/unlist-category",adminAuth.isLogin,adminController.unlistCategory);
router.get("/list-category", adminAuth.isLogin, adminController.listCategory);


router.get('/orders',adminAuth.isLogin,adminController.getUserOrders)
router.get('/ordersView',adminAuth.isLogin,adminController.loadOrdersView);


router.post('/cancel-by-admin',adminController.cancelledByAdmin);
router.post('/reject-by-admin',adminController.rejectCancellation)
router.post('/prepare-by-admin',adminController.productDelevery)
router.post('/deliver-by-admin',adminController.deliveredProduct)


router.get('/addCoupon',adminAuth.isLogin,adminController.Setcoupen)
router.post('/addCoupon',uploads.single('couponImage'),adminController.addCoupon)

router.get('/viewcoupon',adminAuth.isLogin,adminController.couponList)
router.get('/edit-coupon',adminAuth.isLogin,adminController.loadEditCoupon)
router.post('/edit-coupon',uploads.single("couponImage"),adminController.editCoupon)



// router.get('/coupon-edit',adminAuth.isLogin, adminController.editCouponPage);
// router.post('/update-coupon',adminController.updateCoupon)



router.get("*", (req, res) => { res.redirect("/admin");});

// router.get("/table", adminController.tableData);


module.exports = router;
