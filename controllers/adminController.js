const User = require("../models/userModel");
const Product = require("../models/productModel");
const bcrypt = require("bcrypt");
// const { userLogout } = require("./userController");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const { log } = require("handlebars/runtime");
const moment = require("moment-timezone");
const multer = require("multer");
const mongoose=require("mongoose")
const adminHelpers = require('../helpers/adminHelpers')
const fs = require('fs')
const ObjectId = mongoose.Types.ObjectId;




const loginLoad = async (req, res) => {
  try {
    res.render('admin/login')
  } catch (error) {
    console.log(error.message);
  }
};



const loginVerify = async (req, res) => {

try {
  const email = req.body.email;
  const password = req.body.password;


  userData = await User.findOne({ email: email })

  if (userData) {

      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
          if (userData.is_admin === false) {
              res.render('admin/login', { message: 'You are not admin' })
          } else {
              req.session.admin_id = userData._id;
              req.session.is_admin = userData.is_admin


              res.redirect('admin/home')
          }
      } else {
          res.render('admin/login', { message: "Your password is incorrect"})
      }
  } else {
      res.render('admin/login', { message: "Your email is incorrect"})
  }
} catch (error) {
  console.log(error.message, 'failed to verify login')

}
}



const loadDash = async (req, res) => {
  try {
    User.findById({_id:req.session.user_id})
    const dashBoardDetails = await adminHelpers.loadingDashboard(req, res)

    const orderDetails = await adminHelpers.OrdersList(req,res)
    
    const totalUser = dashBoardDetails.totaluser;
    const totalSales = dashBoardDetails.totalSales;
    const salesbymonth = dashBoardDetails.salesbymonth
    const paymentMethod = dashBoardDetails.paymentMethod;
    const yearSales = dashBoardDetails.yearSales
    const todaySales = dashBoardDetails.todaySales
    // console.log(todaySales,'todaySales');
    // console.log(totalUser,'totalUser');
    // console.log(totalSales,'totalSales');
   
    console.log(paymentMethod,'paymentMethod');
    // console.log(yearSales,'yearSales');
   let sales=encodeURIComponent(JSON.stringify(salesbymonth))

   console.log(sales,'sales');

    res.render('admin/home', { totalUser,todaySales:todaySales[0] ,totalSales:totalSales[0], salesbymonth:encodeURIComponent(JSON.stringify(salesbymonth)) ,paymentMethod:encodeURIComponent(JSON.stringify(paymentMethod)),yearSales:yearSales[0],orderDetails:orderDetails })
  } catch (error) {
    console.log(error.message);
  }
};


const adminlogout = async (req, res) => {
    try {
     delete req.session.admin_id
     delete req.session.is_admin
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
      const userData = await User.findByIdAndUpdate(id, { blocked: true });
      res.json({ success: true });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false });
    }
  };
  
  const unblockUser = async (req, res) => {
    try {
      const id = req.query.id;
      console.log(id);
      const userData = await User.findByIdAndUpdate(id, { blocked: false });
      res.json({ success: true });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false });
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
    console.log("haaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaiiiiiiiiiiiiiiii");
    for (let i = 0; i < req.files.length; i++) {
      arrayImage[i] = req.files[i].filename;
    }

    const existingProduct = await Product.findById(req.query.id);
    console.log(req.query.id,"kkkkkkkkkkkkkkkkkkkkkkkkk");
    console.log(existingProduct,"jjjjjjjjjjjjjjjjjjjjjjjjjj");
    console.log("HI UPDATE")
    const id = req.query.id; // Get the product ID from the request body
    console.log(req.body)
    // Create an object with the updated product data
    const updatedProduct = {
      item: req.body.item,
      category: req.body.category,
      inStock: req.body.stock,
      price: req.body.price,
      description: req.body.description,

      // images: arrayImage,
      images: existingProduct.images
      
    };

    const updatedData = 

    await Product.findByIdAndUpdate(
      { _id: id },
      { $set: updatedProduct }
    );
    console.log("gfetttt",updatedData);

    
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
      { _id: id },
      { $set: { cancellationStatus: "cancellation requested", orderStatus: "cancelled" } },
      { new: true }
    ).exec();

    if (
      (updateOrder.paymentMethod === "ONLINE" ||
        updateOrder.paymentMethod === "WALLET") &&
      updateOrder.orderValue > 0
    ) {
      const wallet = await Wallet.findOne({ userId: updateOrder.userId }).exec();

      if (wallet) {
        const updatedWallet = await Wallet.findOneAndUpdate(
          { userId: updateOrder.userId },
          { $inc: { walletAmount: updateOrder.orderValue } },
          { new: true }
        ).exec();
        console.log(updatedWallet, "updated wallet");
      } else {
        const newWallet = new Wallet({
          userId: updateOrder.userId,
          walletAmount: updateOrder.orderValue,
        });
        const createdWallet = await newWallet.save();
        console.log(createdWallet, "created wallet");
      }
    }

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
      { $set: { orderStatus: "Pending", cancellationStatus: "Not requested" } },
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


const loadSalesPage = async(req,res)=>{
  try {

    const orderSuccessDetails = await adminHelpers.orderSuccess()
    // console.log(orderSuccessDetails,'order');
  
    res.render("admin/admin-sales", { order:orderSuccessDetails.orderHistory, total:orderSuccessDetails.total });
  } catch (error) {
     console.log(error.message)
  }
}

const getSalesToday = async(req,res)=>{
  try {
    const todaySales = await adminHelpers.salesToday()
    // console.log(todaySales,'todaySales');
    res.render("admin/admin-sales", { order:todaySales.orderHistory, total:todaySales.total });
  } catch (error) {
    console.log(error.message)
  }
}

const getWeekSales = async(req,res)=>{
  try {
    const weeklySales = await adminHelpers.weeklySales()

     res.render("admin/admin-sales", { order:weeklySales.orderHistory, total:weeklySales.total });
  } catch (error) {
    console.log(error.message)
  }
}

const getMonthSales = async(req,res)=>{
  try {
    const montlySales = await adminHelpers.monthlySales()
    res.render("admin/admin-sales", { order:montlySales.orderHistory, total:montlySales.total });
  } catch (error) {
    console.log(error.message)
  }
}

const getYearlySales = async(req,res)=>{
  try {
    const yearlySales = await adminHelpers.yearlySales()
    res.render("admin/admin-sales", { order:yearlySales.orderHistory, total:yearlySales.total });
  } catch (error) {
    console.log(error.message)
  }
}

const salesWithDate = async(req,res)=>{
  try {
    const salesWithDate = await adminHelpers.salesWithDate(req,res)
    res.render("admin/admin-sales", { order:salesWithDate.orderHistory, total:salesWithDate.total });
  } catch (error) {
    console.log(error.message,'salesWithDate controller error')
  }
}

const downloadSalesReport = async(req,res)=>{
  try {
    const salesPdf = await adminHelpers.salesPdf(req,res)
  } catch (error) {
    console.log(error.message,'pdfSales controller error')
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
  loadSalesPage,
  getSalesToday,
  getWeekSales,
  getMonthSales,
  getYearlySales,
  salesWithDate,
  downloadSalesReport,
 

};