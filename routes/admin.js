var express = require("express");
var session = require("express-session");

const adminAuth = require("../middleware/adminAuth");
var multer = require("multer");
const path = require("path");






const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: storage });





// router.use(session({ secret: config.sessionSecret }));

var router = express.Router();
var config = require("../config/config");
var bodyParser = require("body-parser");
var adminController = require("../controllers/adminController");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

/* GET home page. */
// router.get("/admin", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });
router.get("/", adminAuth.islogOut,adminController.loginLoad);
router.post("/", adminController.loginVerify);
router.get("/home", adminAuth.isLogin,adminController.loadDash);
router.get("/logout", adminAuth.isLogin, adminController.adminlogout);
router.get("/add-products", adminAuth.isLogin, adminController.loadProducts);
router.post(
  "/add-products",
  uploads.single("image"),
  adminController.insertProducts
);


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
router.post("/edit-products",uploads.single("image"),adminController.updateProduct);



router.get("*", (req, res) => {
  res.redirect("/admin");
});

// router.get("/table", adminController.tableData);


module.exports = router;
