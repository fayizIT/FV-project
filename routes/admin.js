var express = require("express");
var session = require("express-session");
const adminAuth = require("../middleware/adminAuth");
var multer = require("multer");
const path = require("path");
const couponController = require('../controllers/couponController')


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


router.get("/edit-product", adminAuth.isLogin,adminController.EditProduct);
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






router.get('/manage-coupons',adminAuth.isLogin, couponController.manageCoupon);
router.get('/add-coupon',adminAuth.isLogin, couponController.addNewCouponGET);
router.post('/add-coupon', couponController.addNewCouponPOST);
router.get('/inactive-coupons',adminAuth.isLogin,couponController.inactiveCouponsGET);
router.get('/edit-coupon',adminAuth.isLogin, couponController.editCouponGET);
router.post('/update-coupon',couponController.updateCouponPOST)
router.post('/change-coupon-status',couponController.changeCouponStatusPOST)



router.get('/salesPage',adminAuth.isLogin,adminController.loadSalesPage)
router.get('/getTodaySales',adminAuth.isLogin,adminController.getSalesToday)
router.get('/getWeekSales',adminAuth.isLogin,adminController.getWeekSales)
router.get('/getMonthlySales',adminAuth.isLogin,adminController.getMonthSales)
router.get('/getYearlySales',adminAuth.isLogin,adminController.getYearlySales)
router.post('/salesWithDate',adminController.salesWithDate)
router.get('/salesReport',adminAuth.isLogin,adminController.downloadSalesReport)

router.get("*", (req, res) => { res.redirect("/admin");});

// router.get("/table", adminController.tableData);


module.exports = router;
