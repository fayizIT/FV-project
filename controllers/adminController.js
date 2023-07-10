const User = require("../models/userModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
const { userLogout } = require("./userController");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const { log } = require("handlebars/runtime");
const moment = require("moment-timezone");
const multer = require("multer");
const Coupon = require("../models/CouponModel")
const mongoose=require("mongoose")
const ObjectId = mongoose.Types.ObjectId;




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
        if (userData.is_admin === 1) {
          req.session.user_id = userData._id;
          console.log(req.session.user_id);
          res.redirect("admin/home");
        } else {
          req.session.user_id = userData._id;
          console.log(req.session.user_id);
          res.redirect("admin/home");
        }
      } else {
        res.render("admin/login", { layouts: "admin-layout", message: "You are not an admin" });
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
    User.findById({_id:req.session.user_id})
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
      var arrayImage =[]
      for (let i = 0; i < req.files.length; i++) {
        arrayImage[i] = req.files[i].filename;
      }
      console.log("started");
      const newProduct = new Product({
        item: req.body.item,
        productName: req.body.productname,
        category: req.body.category,
        inStock: req.body.stock,
        price: req.body.price,
        // images: req.file.filename,
        images: arrayImage,
        description: req.body.description,
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
      const userData = await User.findByIdAndUpdate({ _id: req.body.id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            is_verified: req.body.verified,
          },
        }
      );
  
      res.redirect("/admin/users");
    } catch (error) {
      console.log(error.message);
    }
  };

  const blockUser = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const userData = await User.findByIdAndUpdate({ _id: id },{ $set: { blocked: true } });
      // console.log(userData);
      res.redirect("/admin/users");
    } catch (error) {
      console.log(message.error);
    }
  };

  const unblockUser = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const userData = await User.findByIdAndUpdate({ _id: id },{ $set: { blocked: false } });
      // console.log(userData);
      res.redirect("/admin/users");
    } catch (error) {
      console.log(message.error);
    }
  };



const EditProduct = async (req, res) => {
    try {     
        const id = req.query.id;
        const productData = await Product.findById(id).lean();
        
        if (productData) {
            res.render("admin/edit-products", { products: productData });
           
        } else {
            res.redirect("/admin/home");
           
        }
    } catch (error) {
        console.log(error.message);
    }
};



const updateProduct = async (req,res) => {
  try {
    var arrayImage =[]
    for (let i = 0; i < req.files.length; i++) {
      arrayImage[i] = req.files[i].filename;
    }
    console.log("HI UPDATE")
    const id = req.body.id; // Get the product ID from the request body
    console.log(req.body)
    // Create an object with the updated product data
    const updatedProduct = {
      item: req.body.item,
      category: req.body.category,
      price: req.body.price,
      description: req.body.description,
      images: arrayImage,
    };

    const updatedData = await Product.findByIdAndUpdate(id, updatedProduct, { new: true });
    
   
      res.redirect("/admin/edit-products");
    
  } catch (error) {
    console.log(error.message);
  }
};



const unlistProducts = async (req, res) => {
  try {
   
    const id = req.query.id;
   
    const ProductData = await Product.findByIdAndUpdate(
      { _id: id },
      { $set: { unlist: true } }
    );
    res.redirect("/admin/add-products");
  } catch (error) {
    console.log(error.message);
  }
};
const listProducts = async (req, res) => {
  try {
    const id = req.query.id;
    const ProductData = await Product.findByIdAndUpdate(
      { _id: id },
      { $set: { unlist: false } }
    );
    res.redirect("/admin/add-products");
  } catch (error) {
    console.log(error.message);
  }
};



const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { unlist: true } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};
const listCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { unlist: false } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};


const getUserOrders = async (req, res) => {
  try {
    console.log('entered into getUSERORDERS'); 
    const orderData = await Order.find().populate("userId").lean();
    console.log(orderData, "order data coming");
    const orderHistory = orderData.map((history) => {
      let createdOnIST = moment(history.date)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY h:mm A");

      return { ...history, date: createdOnIST, username: history.userId.name };
    });
    console.log(orderHistory, "order serial numbers");
    res.render("admin/userOrder", {
      
      orderData: orderHistory,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const loadOrdersView=async(req,res)=>{
  try {
    console.log("Enterd into the Orederview page........");
      const orderId = req.query.id;
     

      console.log(orderId, 'orderId');
      const order = await Order.findOne({ _id: orderId })
          .populate({
              path: 'products.productId',
              select: 'item price images',
          })


      const createdOnIST = moment(order.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
      order.date = createdOnIST;

      const orderDetails = order.products.map(product => {
          const images = product.productId.images || []; // Set images to an empty array if it is undefined
          const image = images.length > 0 ? images[0] : ''; // Take the first image from the array if it exists
    
          return {
            item: product.productId.item,
            image: images,
            price: product.productId.price,
            total: product.total,
            kg: product.kg,
            status : order.orderStatus,
           
          };
      });

      const deliveryAddress = {        
        name: order.addressDetails.name,
        address: order.addressDetails.address,
        city: order.addressDetails.city,
        state: order.addressDetails.state,
        pincode: order.addressDetails.pincode,
      };



      const subtotal = order.orderValue;
      const cancellationStatus = order.cancellationStatus


      console.log(cancellationStatus,'cancellationStatus');
      console.log(subtotal, 'subtotal');
      console.log(orderDetails, 'orderDetails');
      console.log(deliveryAddress, 'deliveryAddress');

      res.render('admin/userOrderView', {
          orderDetails: orderDetails,
          deliveryAddress: deliveryAddress,
          subtotal: subtotal, 
          orderId: orderId,
          orderDate: createdOnIST,
           cancellationStatus:cancellationStatus,
      });
  } catch (error) {
      throw new Error(error.message);
  }
}



const cancelledByAdmin = async (req, res) => {
  try {
    const id = req.body.orderId;
    console.log(id, 'id');

    const url = '/admin/ordersView?id=' + id;
    console.log(url, 'url');

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { cancellationStatus: "cancellation requested", orderStatus: "cancelled" } },
      { new: true }
    ).exec();
    
    console.log(updateOrder, 'updateOrder');

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};




const rejectCancellation = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    console.log(orderId, 'orderID..............');

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { orderStatus: "Placed", cancellationStatus: "Not requested" } },
      { new: true }
    ).exec();

    console.log(updateOrder, 'OrderUpdated.............');

    const url = '/admin/ordersView?id=' + orderId;
    console.log(url, 'url......................');
    
    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};






//form other side 


const productDelevery = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    console.log(orderId, 'id here............');

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { orderStatus: "Shipped", cancellationStatus: "Shipped" } },
      { new: true }
    ).exec();

    console.log(updateOrder, 'updateOrderrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');

    const url = '/admin/ordersView?id=' + orderId;
    console.log(url, 'Here is the url..................');
    
    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};


const deliveredProduct = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    console.log(orderId, 'id here...........');

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: { orderStatus: "Delivered", cancellationStatus: "Delivered" } },
      { new: true }
    ).exec();

    console.log(updateOrder, 'updateOrder here..........');

    const url = '/admin/ordersView?id=' + orderId;
    console.log(url, 'url goes here...........');
    
    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};














const Setcoupen =async(req,res)=>{
  try {
    res.render("admin/AddCoupon")
    
  } catch (error) {
    console.log(error.message);
    
  }
}



const addCoupon=async(req,res)=>{
  try{
   console.log()
  console.log('adddddddddddCoupon',req.body)

  const coupon=new Coupon ({
    coupenCode:req.body.couponCode,
    couponAmount:req.body.couponDiscount,
    minimumAmount:req.body.couponMinAmount,
    description:req.body.couponDescription,
    image:req.file.filename,
    startDate:req.body.couponStart,
    expiryDate:req.body.couponExpire,
  }).save()
  console.log("getttttttttttttt",coupon);
  res.redirect('admin/AddCoupon')

  }catch(error){
    console.log(error.message);
    res.render('404')
  }
}


 




const loadEditCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    const coupon = await Coupon.findOne({ _id: id });
    res.render("editCoupon", { coupon: coupon, currentPage: "",err:'' });
  } catch (error) {
    console.log(error.message);
  }
};
const editCoupon = async (req, res) => {
  try {
    const id = req.body.couponId;

    const coupon = await Coupon.findOne({ _id: id });
    // const checkIdentical=await Coupon.findOne({couponCode:req.body.code, _id: { $ne: id }})
    const checkCoupon = await Coupon.findOne({
      couponCode: { $regex: '^' + req.body.code + '$', $options: 'i' },
      $expr: { $eq: [ { $strLenCP: "$couponCode" }, req.body.code.length ] },_id: { $ne: id }
    })
    if(!checkCoupon ){
      if(req.body.percentage<=25){

        const updatedCoupon = {
          couponCode: req.body.code,
          percentage: req.body.percentage,
          description: req.body.description,
          expiryDate: req.body.expiryDate,
          image: coupon.image,
          status: coupon.status,
        };
        const date = new Date(req.body.expiryDate);
        const now = new Date();
        if (date > now) {
          updatedCoupon.status = "Active";
        }
    
        if (req.file) {
          updatedCoupon.image = req.file.filename;
        }
        const couponUpdate = await Coupon.updateOne(
          { _id: id },
          { $set: updatedCoupon }
        );
        res.redirect("/admin/Coupon");
      }else{
        res.render('admin/editCoupon',{message:"can't exceed 25 percentage",err:1,coupon: coupon, currentPage: "" })
      }
    }else{
      res.render('admin/editCoupon',{message:"can't add existing couponCode",err:2,coupon: coupon, currentPage: "" })
    }
  } catch (error) {
    console.log(error.message);
  }
};



const couponList=async(req,res)=>{
  try{
    const coupons= await Coupon.find({})
    const currentDate=new Date()
    for(const coupon of coupons){
      if(coupon.expiryDate <= currentDate){
        coupon.status='Expired'
        await coupon.save()
      }
     
    }

res.render('admin/coupon',{coupons})

  }catch(error){
    console.log(error.message);
    res.render('404')
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
  blockUser,
  unblockUser,
  EditProduct,
  updateProduct,
  unlistProducts,
  listProducts,
  unlistCategory,
  listCategory,
  getUserOrders,
  loadOrdersView,
  cancelledByAdmin,
  rejectCancellation,
  productDelevery,
  deliveredProduct,
  Setcoupen,
  addCoupon,
  couponList,
  // updateCoupon,
  // editCouponPage,
  editCoupon,
  loadEditCoupon,
  couponList,
 

};