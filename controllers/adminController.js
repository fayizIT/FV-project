const User = require("../models/userModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const { userLogout } = require("./userController");
const Category = require("../models/categoryModel");
const { log } = require("handlebars/runtime");
const multer = require("multer");



const loginLoad = async (req, res) => {
  try {
    res.render('admin/login', { layouts: "admin-layout" })
  } catch (error) {
    console.log(error.message);
  }
};

const loginVerify = async (req, res) => {
  try {
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    console.log(userData);
    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);
      console.log(passMatch);
      if (passMatch) {
        if (userData.is_admin === 0) {
          res.render("admin/login", { layouts: "admin-layout" });
        } else {
          req.session.user_id = userData._id;
          console.log(req.session.user_id);
          res.redirect("admin/home");
        }
      }
    } else {
      res.render("admin/login", { layouts: "admin-layout" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDash = async (req, res) => {
  try {
    User.findById({_id:req.session})
    res.render('admin/home', );
  } catch (error) {
    console.log(error.message);
  }
};


const adminlogout = async (req, res) => {
    try {
      req.session.destroy();
      res.redirect('/admin/login');
    } catch (error) {
      console.log(error.message);
     
    }
  };

  const loadProducts = async (req, res) => {
    try {
      const updateProducts = await Product.find().lean();
      const productWithSerialNumber = updateProducts.map((products, index) => ({
        ...products,
        serialNumber: index + 1,
      }));
      const categories = await Category.find().lean();
      res.render("admin/add-products", {
        // layouts: "admin-layout",
        products: productWithSerialNumber,
        categories: categories,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadCategory = async (req, res) => {
    try {
      const updatedcategory = await Category.find().lean();
      const categoryWithSerialNumber = updatedcategory.map((category, index) => ({
        ...category,
        serialNumber: index + 1,
      }));
      res.render("admin/category", {
        // layout: "admin-layout",
        category: categoryWithSerialNumber,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };

  const insertProducts = async (req, res) => {
    try {
      const newProduct = new Product({
        brand: req.body.brand,
        productName: req.body.productname,
        category: req.body.category,
        price: req.body.price,
        // offPrice:dealprice,
        // quantity:stock,
        images: req.file.filename,
        description: req.body.description,
        // strapColour:req.body.strapColour,
      });
  
      const addProductData = await newProduct.save();
      console.log(addProductData);
      if (addProductData) {
        await Category.updateOne(
          {
            category: req.body.category,
          },
          {
            $push: { products: newProduct._id },
          }
        );
        const updateProducts = await Product.find().lean();
        const productWithSerialNumber = updateProducts.map((products, index) => ({
          ...products,
          serialNumber: index + 1,
        }));
        const categories = await Category.find().lean();
        res.render("admin/add-products", {
          // layouts: "admin-layout",
          products: productWithSerialNumber,
          categories: categories,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addCategory = async (req, res) => {
    try {
      const category = req.body.category.toUpperCase();
  
      const existingCategory = await Category.findOne({
        category: { $regex: new RegExp("^" + category + "$", "i") },
      });
      if (existingCategory) {
        const errorMessage = "category already exits";
        const updatedcategory = await Category.find().lean();
        const categoryWithSerialNumber = updatedcategory.map(
          (category, index) => ({
            ...category,
            serialNumber: index + 1,
          })
        );
  
        return res.render("admin/category", {
          // layouts: "admin-layout",
          category: categoryWithSerialNumber,
          error: errorMessage,
        });
      }
      const newCategory = new Category({
        category: category,
      });
      const categories = await newCategory.save();
      return res.redirect("/admin/category");
    } catch (error) {
      console.log(error.message);
    }
  };

  const addUsers = async (req, res) => {
    const userData = await User.find({ is_admin: 0 }).lean();
    console.log(userData);
    const usersWithSerialNumber = userData.map((users, index) => ({
      ...users,
      serialNumber: index + 1,
    }));
    res.render("admin/users", {
      // layouts: "admin-layout",
      user: usersWithSerialNumber,
    });
  };



  const editUser = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const userData = await User.findById({ _id: id }).lean();
      console.log(userData);
      if (userData) {
        // res.redirect("/admin/home");
        res.render("admin/edit-user", {
          user: userData,
        });
      } else {
        res.redirect("/admin/home");
      }
    } catch (error) {
      console.log(error.message);
    }
  };



  const updateUser = async (req, res) => {
    try {
      const userData = await User.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            is_verified: req.body.verified,
          },
        }
      );
  
      res.redirect("/admin/home");
    } catch (error) {
      console.log(error.message);
    }
  };


  const blockUser = async (req,res)=>{
    try {
      const id = req.query.id;
    console.log(id);
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { blocked: true } }
    );
    // console.log(userData);
    res.redirect("/admin/user");
      
    } catch (error) {
      console.log(message.error);
      
    }
  }

module.exports = {
  loginLoad,
  loginVerify,
  loadDash,
  adminlogout,
  loadProducts,
  insertProducts,
  loadCategory,
  addCategory,
  addUsers,
  editUser,
  updateUser,
  blockUser
};
