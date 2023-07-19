const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
var Address = require("../models/addressesModel");
const userHelpers = require("../helpers/userHelpers")

const Razorpay = require("razorpay");
var instance = new Razorpay({
    key_id: 'rzp_test_lttgGofXL0RV96',
    key_secret: 'tjY5jtZTUF0hWyBS9M4E2EMI',
});

module.exports = {
 
  getProductListForOrders: async (userId) => {
  try {
    const productDetails = await Cart.findOne({ user_id: userId });

    if (!productDetails || !productDetails.products) {
      return false;
    }

    const subtotal = productDetails.products.reduce((acc, product) => {
      return acc + product.total;
    }, 0);

    const products = productDetails.products.map((product) => ({
      productId: product.productId,
      kg: product.kg,
      total: product.total,
    }));

    return products;
  } catch (error) {
    console.log(error);
    return false;
  }
},


  getCartValue: (userId) => {
    return new Promise(async (resolve, reject) => {
      const productDetails = await Cart.findOne({ user_id: userId });

      const subtotal = productDetails.products.reduce((acc, products) => {
        return acc + products.total;
      }, 0);

      if (subtotal) {
        resolve(subtotal);
      } else {
        resolve(false);
      }
    });
  },
  
  placingOrder: async (userId, orderData, orderedProducts, totalOrderValue) => {
    console.log("enter  the helper placing order");
    let orderStatus =
      orderData["paymentMethod"] === "COD" ? "Pending" : "PENDING";
    console.log(orderStatus, "this is the order status");
    const defaultAddress = await Address.findOne(
      { user_id: userId, "addresses.is_default": true },
      { "addresses.$": 1 }
    ).lean();
    console.log(defaultAddress, "defaultadress of the user is here");

    if (!defaultAddress) {
      console.log("default address not found");
      return res.redirect("/address");
    }
    const defaultAddressDetails = defaultAddress.addresses[0];
    const address = {
      name: defaultAddressDetails.name,
      mobile: defaultAddressDetails.mobile,
      address: defaultAddressDetails.address,
      city: defaultAddressDetails.city,
      state: defaultAddressDetails.state,
      pincode: defaultAddressDetails.pincode,
    };
    console.log(address, "address of the order placing");
    const orderDetails = new Order({
      userId: userId,
      date: Date(),
      orderValue: totalOrderValue,
      paymentMethod: orderData["paymentMethod"],
      orderStatus: orderStatus,
      products: orderedProducts,
      addressDetails: address,
    });
    console.log(
      orderDetails,
      "this is the order details of the user from helper"
    );
    const placedOrder = await orderDetails.save();
    console.log(placedOrder, "save to the database");

    const stockDecrease = await userHelpers.updateProductStock(
      orderedProducts
    );
    await Cart.deleteMany({ user_id: userId });
    console.log("placing db order id here jdslkcjdsjk");
    let dbOrderId = placedOrder._id.toString();
    console.log(dbOrderId, "order id of the user");
    
   
    return dbOrderId;
  },

  generateRazorpayOrder: (orderId, totalOrderValue) => {
    orderValue = totalOrderValue * 100;
    return new Promise((resolve, reject) => {
      let orderDetails = {
        amount: orderValue, // amount in the smallest currency unit
        currency: "INR",
        receipt: orderId,
      };
      instance.orders.create(orderDetails, function (err, orderDetails) {
        console.log("New order :", +err);
        
        resolve(orderDetails);
      });
    });
  },
};