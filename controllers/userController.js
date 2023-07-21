const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const Product = require("../models/productModel");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const randomstring = require("randomstring");
const Cart = require("../models/cartModel")
const mongoose = require('mongoose');
const Addresses = require("../models/addressesModel");
var Address = require("../models/addressesModel");
const Order = require("../models/orderModel");
const Wallet = require("../models/walletModel");
const productHepler = require("../helpers/productHelper");
const moment = require("moment-timezone");
const ObjectId = mongoose.Types.ObjectId;
const twilio = require("twilio");
const categoryModel = require('../models/categoryModel');
const accountSid = "AC33898e9e5916409727aac0861a79477e";
const authToken = "e3e624c360264e92bedc120ae25754b6";
const verifySid = "VAce328069e0ce1eceb47a1fefecc125f2";
const client = require("twilio")(accountSid, authToken);
const productHelper = require("../helpers/productHelper")
const userHelpers = require("../helpers/userHelpers")
const couponHelpers = require('../helpers/couponHelpers')
const Razorpay = require("razorpay");
var instance = new Razorpay({key_id: 'rzp_test_lttgGofXL0RV96', key_secret: 'tjY5jtZTUF0hWyBS9M4E2EMI'});




const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};



const insertUser = async (req, res) => {
  console.log("eddddddddddddddddddd");
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.render("users/signup", { message: "Passwords do not match" });
    }

    const email = req.body.email;
    const mobile = req.body.mobile;

    // Check if email or mobile already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    console.log(existingUser, "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    if (existingUser) {
      if (existingUser.email === email) {
        return res.render("users/signup", {
          message: "Email already exists, please use a different email",
        });
      } else if (existingUser.mobile === mobile) {
        return res.render("users/signup", {
          message: "Mobile number already exists, please use a different mobile number",
        });
      }
    }

    console.log(existingUser);

    const spassword = await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: spassword,
      is_admin: 0, // Set is_verified to 0 initially
    });

    const userData = await user.save();
    if (userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);
      res.redirect("/success"); // Redirect to the success page
    } else {
      res.render("users/signup", { message: "Your registration has failed" });
    }
  } catch (error) {
    res.render("error", { error });
  }
};

//reset password through mail mail 
const sendResetpasswordmail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });
    const mailOption = {
      from: config.emailUser,
      to: email,
      subject: "to Reset Password",
      html:
        "<p> hi" +
        name +
        ',please click here to <a href="http://fayizcj.in/forget-password?token=' +
        token +
        '">reset </a>your password</p>',
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//load the signup page
const loadSignup = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render("users/signup");
  } catch (error) {
    res.render("error", { error });
  }
};


//after signup showing success
const successPage = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render("users/success", { signInPage: true });
  } catch (error) {
    res.render("error", { error });
  }
};



//for send mail and open 
const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTls: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: "fayizcj94@gmail.com",
      to: email,
      subject: "Verify Your Email",
      html:
        "<p>Hi " +
        name +
        ', please click <a href="http://fayizcj.in/verify?id=' +
        user_id +
        '">here</a> to verify your email.</p>',
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};



//verify in ethrealmail
const verifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    res.render("users/email-verified");
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};




//welcome page
const loadwelcome = async (req, res) => {
  try {
    const productData = await Product.find({ unlist: false }).lean()
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render("users/index", { Product: productData });
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};


//login the page
const loadlogin = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render("users/login");
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};

//checking the email and password before login
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      return res.render('users/login', { message: "Email and password are incorrect" });
    }

    // Check if the user is blocked
    if (userData.blocked) {
      return res.render('users/login', { message: "User is blocked. Please contact the administrator." });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.render('users/login', { message: "Email and password are incorrect" });
    }

    if (userData.is_verified === 0) {
      return res.render('users/login', { message: "Please verify your email" });
    } else {
      req.session.user_id = userData._id;
      req.session.blocked = userData.blocked
      console.log(req.session.blocked, ' req.session.blocked');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.redirect('/home');
    }



  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};


//forgot page
const forgetLoad = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.render('users/forget');
  } catch (error) {
    console.log(error.message);
  }
};

//forgot the passord send a mail for reset the password
const sendResetLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === 0) {
        res.render('users/forget', { message: "Please verify your email" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
        sendResetpasswordmail(userData.name, userData.email, randomString);
        res.render('users/forget', { message: "Please check your email for password reset instructions" });
      }
    } else {
      res.render('users/forget', { message: "Email is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.render('error', { error });
  }
};

//go to homepage
const loadindex = async (req, res) => {
  try {
    const productData = await Product.find({ unlist: false }).lean()
    const categoryData = await categoryModel.find({ unlist: false }).lean()
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const userData = await User.findById({ _id: req.session.user_id })
    res.render('users/index', { user: userData, Product: productData, category: categoryData });
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};

const loadAbout = async (req, res) => {
  try {
    res.render("users/about")

  } catch (error) {
    console.log(error.message);

  }
};

const loadContact = async (req, res) => {
  try {
    res.render("users/contact")

  } catch (error) {
    console.log(error.message);

  }
}





const loadprofile = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user_id);
    console.log(userId, "user id.....");
    const userData = await User.findOne({ _id: userId }).lean();
    const defaultAddress = await Addresses.findOne(
      { user_id: userId, "addresses.is_default": true },
      { "address.$": 1 }
    ).lean();
    console.log(defaultAddress, "defaultAddress");
    if (defaultAddress) {
      res.render("users/profile", {
        userData,
        defaultAddress: defaultAddress.addresses,
      });
    } else {
      res.render("users/profile", { userData });
    }
  } catch (error) {
    console.log(error.message);
  }
};





// user profile edit and update 

const editLoad = async (req, res) => {
  try {
    console.log(req.file, 'userimage');
    const id = new mongoose.Types.ObjectId(req.session.user_id);
    const userData = await User.findById({ _id: id }).lean();

    if (!userData) {
      throw new Error('User data not found');
    }

    let updatedUserData = {
      image: userData.images, // Use the previous image data as the starting point
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile
    };
    if (req.file) {
      // Check if a new image file is uploaded
      updatedUserData.image = req.file.filename; // Update with the new image filename

    }

    const updatedUser = await User.findByIdAndUpdate({ _id: id }, { $set: updatedUserData }, { new: true });
    res.redirect('/profile');
  } catch (error) {
    throw new Error(error.message);
  }
}





//logout 
const userLogout = async (req, res) => {
  try {
    delete req.session.user_id;
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};


// after verify to rseting password in mail goes through this page 
const forgetPasswordLoad = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render("users/forget-password", { user_id: tokenData._id });

    } else {
      res.render("error", { message: "Token is invalid." })
    }
    console.log("reseting started");
  } catch (error) {
    console.log(err.message);

  }
}


// reseting the password

const resetPassword = async (req, res) => {
  try {

    const password = req.body.password;
    const user_id = req.body.user_id;
    const sec_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(user_id, {
      $set: { password: sec_password, token: "" },
    }, { new: true },);
    console.log("reseetting done");
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};




//for verification send link

const verificationLoad = async (req, res) => {
  try {
    res.render("users/verification")

  } catch (error) {
    console.log(error.message);

  }
}

const sendVerificationLink = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {

      sendVerifyMail(userData.name, userData.email, userData._id);
      res.render('users/verification', { message: "Reset verification mail sent your  mail id,please check" })

    } else {
      res.render('users/verification', { message: "This email is not exist" })
    }
  } catch (error) {
    console.log(error.message);

  }
}

//otp verification
const otpLoad = async (req, res) => {
  try {
    res.render("users/otp-verify")


  } catch (error) {

    console.log(error.message);

  }
}



const sendOtp = async (req, res) => {
  try {

    console.log(req.body.mobile, "requiring mobile no");
    let mobile = req.body.mobile;

    console.log(mobile, 'mobile no');
    req.session.userMobileForOtp = mobile;
    const userData = await User.findOne({ mobile: mobile })
    console.log(userData);
    if (userData) {
      if (userData.is_verified === 1) {
        const userMobile = "+91" + mobile;
        console.log(userMobile, "userMobile...");
        client.verify.v2
          .services(verifySid)
          .verifications.create({ to: userMobile, channel: "sms" })
          .then((verification) => {
            console.log(verification.status, 'staus..........');
            if (verification.status === "pending") {
              console.log('ffffffffffffffffffffff');

              res.render('users/otp-enter')

            } else {
              res.render('users/otp-verify', { message: "OTP sending failed" })
            }
          })

      } else {
        res.render('users/otp-verify', { message: "You have to verify email before OTP login" })
      }

    } else {
      res.render('users/otp-verify', { message: "You have to signup before OTP login" })
    }
  } catch (error) {
    throw new Error(error.message);
  }
}







const loadVerifyOtp = async (req, res) => {
  try {
    res.render('users/otp-enter')
  } catch (error) {
    throw new Error(error.message);
  }
}

const verifyOtp = async (req, res) => {
  try {
    console.log('iiiiiiiiiiiiiiiiiiiiii');
    const userMobile = "+91" + req.session.userMobileForOtp

    console.log(userMobile, 'mobile sessionnnnnnnnnnnn');
    const otp = req.body.otp;
    client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: userMobile, code: otp })
      .then(async (verification_check) => {
        if (verification_check.status === 'approved') {
          console.log(verification_check.status)
          let user = await User.findOne({ mobile: req.session.userMobileForOtp })

          req.session.user_id = user._id;

          console.log(req.session.user_id);

          res.redirect('/home');
        } else {
          res.render('users/otp-verify', { message: "invalid OTP" })
        }

      });
  } catch (error) {   

    throw new Error(error.message);
  }
}


const viewPage = async (req, res) => {
  try {
    const productId = req.query.id;

    const singleProduct = await Product.findOne({ _id: productId }).lean()


    res.render("users/view-product", {
      singleProduct: singleProduct
    });
  } catch (error) {
    console.log(error.message);
    res.render("404");
  }
};



const addToCart = async (req, res) => {
  try {
    const proId = req.body.productId;
    let cart = await Cart.findOne({ user_id: req.session.user_id });

    if (!cart) {
      const newCart = new Cart({ user_id: req.session.user_id, products: [] });
      await newCart.save();
      cart = newCart;
    }

    const existingProductIndex = cart.products.findIndex((product) => {
      return product.productId.toString() === proId;
    });
    console.log(existingProductIndex,"existingProductIndex");

    if (existingProductIndex === -1) {
      const product = await Product.findById(proId).lean();
      const total = product.price;
      cart.products.push({
        productId: proId,
        kg: 1,
        total,
      });
    } else {
      const product = await Product.findById(proId).lean();
      const existingProduct = cart.products[existingProductIndex];
        if (existingProduct.kg + 1 > product.inStock) {
          return res.status(400).json({ message: "stock limit reached" });
        }
      cart.products[existingProductIndex].kg += 1;
      cart.products[existingProductIndex].total += product.price; // Update the total by adding the price of the product
    }

    cart.total = cart.products.reduce((total, product) => {
      return total + product.total;
    }, 0);

    await cart.save();
    console.log(cart);

    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.session.user_id })
      .populate({
        path: "products.productId",
      })
      .lean()
      .exec();

    if (!cart) {
      return res.render("users/cart");
    }

    const products = cart.products.map((product) => {
      const total = Number(product.kg) * Number(product.productId.price);
      return {
        _id: product.productId._id.toString(),
        item: product.productId.item,
        images: product.productId.images,
        price: product.productId.price,
        description: product.productId.description,
        kg: product.kg,
        total,
        user_id: req.session.user_id,
      };
    });

    const total = products.reduce((sum, product) => sum + Number(product.total), 0);
    const totalCount = products.length;
    const finalAmount = total;

    res.render("users/cart", {
      products,
      total,
      totalCount,
      subtotal: total,
      finalAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const changeQuantity = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);
    const kg = req.body.kg;
    const count = req.body.count;
    const cartFind = await Cart.findOne({ user_id: userId });
      const productsData = await Product.findById(productId);

      const findProduct = cartFind.products.find((product) =>
        product.productId._id.equals(productId)
      );
    
      const sumProductKgAndCount =
        parseInt(findProduct.kg) + parseInt(count);

      if (sumProductKgAndCount > productsData.inStock) {
        const response = { outOfStock: true };
        res.send(response);
        return response;
      }
      console.log(productsData, "productsData is here ..............");
      const cartId = cartFind._id;
      console.log(userId, "userId");
      console.log(productId, "productid");
      console.log(kg, "kg");
      console.log(cartId, "cartId");
      console.log(count, "count");

      // Find the cart for the given user and product
    const cart = await Cart.findOneAndUpdate(
      { user_id: userId, 'products.productId': productId },
      { $inc: { 'products.$.kg': count } },
      { new: true }
    ).populate('products.productId');

    if (!cart || !cart.products) {
      throw new Error('Cart not found');
    }


    // Update the total for the specific product in the cart
    const updatedProduct = cart.products.find(product => product.productId.equals(productId));
    if (!updatedProduct) {
      throw new Error('Product not found in cart');
    }

    let productTotal = 0
    updatedProduct.total = updatedProduct.productId.price * updatedProduct.kg;
    productTotal = updatedProduct.total;


    if (updatedProduct.kg <= 0) {
      cart.products = cart.products.filter(product => !product.productId.equals(productId));
      await cart.save();
      const response = { deleteProduct: true };
      return res.json(response);
    }

    await cart.save();

    const subtotal = cart.products.reduce((acc, product) => {
      return acc + product.total;
    }, 0);

    const response = {
      kg: updatedProduct.kg,
      subtotal: subtotal,
      productTotal
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const loadAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userAddress = await Addresses.findOne({ user_id: userId })
      .lean()
      .exec();
    console.log(userAddress, "userAddressss");
    if (userAddress) {
      if (userAddress.addresses.length === 1) {
        userAddress.addresses[0].is_default = true;
      }

      const addressDetails = userAddress.addresses.map((address) => {
        return {
          name: address.name,
          mobile: address.mobile,
          address: address.address,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          _id: address._id,
          is_default: address.is_default,
        };
      });

      res.render("users/address", { addressDetails });
    } else {
      res.render("users/address", {
        addressDetails: [],
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const addressList = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const name = req.body.name;
    const mobile = req.body.mobile;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const address = req.body.address;
    console.log(name);

    console.log(city);
    console.log(state);
    console.log(pincode);
    const newAddress = {
      name: name,
      mobile: mobile,
      address: address,
      city: city,
      state: state,
      pincode: pincode,
      is_default: false,
    };

    let userAddress = await Addresses.findOne({ user_id: userId });
    // console.log(userAddress, "useraddresssssss");
    if (!userAddress) {
      newAddress.is_default = true;
      userAddress = new Addresses({ user_id: userId, addresses: [newAddress] });
    } else {
      userAddress.addresses.push(newAddress);
      if (userAddress.addresses.length === 1) {
        userAddress.addresses[0].is_default = true;
      }
    }

    await userAddress.save();
    console.log(userAddress, "useraddress");

    res.redirect("/address");
  } catch (error) {
    throw new Error(error.message);
  }
};

const deletingAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const userId = req.session.user_id;

    const address = await Addresses.findOne({ user_id: userId });

    const deletedAddress = address.addresses.find(
      (addr) => addr._id.toString() === id
    );
    console.log(deletedAddress, "deletedAddress");
    const isDefaultAddress = deletedAddress && deletedAddress.is_default;
    console.log(isDefaultAddress, "isDefaultAddress");

    address.addresses = address.addresses.filter(
      (addr) => addr._id.toString() !== id
    );

    if (isDefaultAddress && address.addresses.length > 0) {
      const newDefaultAddress = address.addresses.find(
        (addr) => addr._id.toString() !== id
      );
      if (newDefaultAddress) {
        newDefaultAddress.is_default = true;
      }
      console.log(newDefaultAddress, "newDefaultAddress");
    }

    // Save the updated address
    await address.save();
    res.redirect("/address");
  } catch (error) {
    throw new Error(error.message);
  }
};



const editAddress = async (req, res) => {
  try {
    console.log("edit address entering");
    const userId = req.session.user_id;
    const id = req.body._id;
    console.log(id, "id gettttttttttt");
    const name = req.body.name;
    const mobile = req.body.mobile;
    const address = req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;

    const updatedAddress = await Addresses.findOneAndUpdate(
      { user_id: userId, "addresses._id": id },
      {
        $set: {
          "addresses.$.name": name,
          "addresses.$.mobile": mobile,
          "addresses.$.address": address,
          "addresses.$.city": city,
          "addresses.$.state": state,
          "addresses.$.pincode": pincode,
        },
      },
      { new: true }
    );
    console.log(updatedAddress, "updatedAddresssssss");
    if (updatedAddress) {
      console.log("Address updated successfully:", updatedAddress);
      res.redirect("/address");
    } else {
      console.log("Address not found or not updated");
      res.redirect("/address");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const settingAsDefault = async (req, res) => {
  try {
    const addressId = req.body.addressId;
    const userId = req.session.user_id;
    console.log(addressId, "get the address id");
    // Find the current default address and unset its "isDefault" flag
    const old = await Addresses.findOneAndUpdate(
      { user_id: userId, "addresses.is_default": true },
      { $set: { "addresses.$.is_default": false } }
    );
    console.log(old, "old address");
    // Set the selected addresses as the new default addresses
    const defaultAddress = await Addresses.findOneAndUpdate(
      { user_id: userId, "addresses._id": addressId },
      { $set: { "addresses.$.is_default": true } }
    );
    console.log(defaultAddress, "get teh default");
    const response = {
      setDefault: true,
    };

    res.json({ status: true });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to set addresses as default" });
  }
};

const changeAddress = async (req, res) => {
  try {
    console.log("entred chnge address");
    const userId = req.session.user_id;
    const addressId = req.body.addressId;
    console.log(addressId, "addressid");
    const userDocument = await Addresses.findOne({ user_id: userId }).lean();
    const addressArray = userDocument.addresses;

    console.log(addressArray, "addressarray");
    console.log(userDocument, "userDoccsss");

    const changeAddress = addressArray.find(
      (address) => address._id.toString() === addressId
    );
    console.log(changeAddress, "changeaddresss");
    const filteredAddresses = addressArray.filter(
      (address) => !address.is_default
    );
    console.log(filteredAddresses, "filteredaddresss of change ");

    const cart = await Cart.findOne({ user_id: userId })
      .populate({
        path: "products.productId",
      })
      .lean()
      .exec();

    const products = cart.products.map((product) => {
      const total =
        Number(product.kg) * Number(product.productId.price);

      return {
        _id: product.productId._id.toString(),
        item: product.productId.item,
        images: product.productId.images,
        price: product.productId.price,
        description: product.productId.description,
        kg: product.productId.kg,
        total,
        user_id: req.session.user_id,

      };
    });

    const total = products.reduce(
      (sum, product) => sum + Number(product.total),
      0
    );
    const finalAmount = total;
    const count = products.length;
    res.render("users/checkout", {
      defaultAddress: changeAddress,
      filteredAddresses: filteredAddresses,
      products,
      total,
      count,
      subtotal: total,
      finalAmount,
    });
  } catch (error) {
    console.log(error.message);
  }
}


const checkoutLoad = async (req, res) => {
  try {

    const userId = req.session.user_id;
    // console.log(userId, 'id');
    // Find the default address for the user
    const defaultAddress = await Address.findOne({ user_id: userId, 'addresses.is_default': true }, { 'addresses.$': 1 }).lean();

    // console.log(defaultAddress, 'default address');
    if (defaultAddress === null) {
      res.redirect('/address')
    } else {



      // Find the user document and extract the address array
      const userDocument = await Address.findOne({ user_id: userId }).lean();
      const addressArray = userDocument.addresses;
      // console.log(addressArray, 'addressArray');

      // Filter the addresses where isDefault is false
      const filteredAddresses = addressArray.filter(address => !address.is_default);
      // console.log(filteredAddresses, 'filteredAddresses');




      // finding cart products //

      const cart = await Cart.findOne({ user_id: req.session.user_id })
        .populate({
          path: 'products.productId',
          populate: { path: 'category', select: 'category' },
        })
        .lean()

        .exec();

      const products = cart.products.map((product) => {
        const total =
          Number(product.kg) * Number(product.productId.price);
        return {
          _id: product.productId._id.toString(),
          item: product.productId.item,
          images: product.productId.images,
          price: product.productId.price,
          description: product.productId.description,
          kg: product.productId.kg,
          total,
          user_id: req.session.user_id,
        };
      });

      const total = products.reduce(
        (sum, product) => sum + Number(product.total),
        0
      );
      let finalAmount = total;
      // Get the total count of products
      let totalCount = products.length;

      //coupon requested by user 
      let couponError = false;
      let couponApplied = false;

      if (req.session.couponInvalidError) {
        couponError = req.session.couponInvalidError;

      } else if (req.session.couponApplied) {

        couponApplied = req.session.couponApplied
      }

      //valid coupon check and discount amount calculation with the helper-coupon
      let couponDiscount = 0;
      const eligibleCoupon = await couponHelpers.checkCurrentCouponValidityStatus(userId, finalAmount);

      if (eligibleCoupon.status) {
        couponDiscount = eligibleCoupon.couponDiscount
      } else {
        couponDiscount = 0;
      }


      finalAmount = finalAmount - couponDiscount

      res.render('users/checkout',
        {
          defaultAddress: defaultAddress.addresses[0],
          filteredAddresses: filteredAddresses,
          products,
          total,
          totalCount,
          couponApplied,
          couponError,
          couponDiscount,
          subtotal: finalAmount,
          // finalAmount,
        });
      delete req.session.couponApplied;
      delete req.session.couponInvalidError

    }

  } catch (error) {
    throw new Error(error.message);
  }
}


const orderPlaced = async (req, res) => {
  try {
    res.render('users/orderPlaced')
  } catch (error) {
    console.log(error.message);
  }
}




const orderFailed = async (req, res) => {
  try {
    res.render('users/orderFailed')
  } catch (error) {
    console.log(error.message);
  }
}


const walletOrder = async (req, res) => {
  try {
    console.log("wallet order controller");
    const orderId = req.query.id;
    const userId = req.session.user_id;
    const updatewallet = await userHelpers.updatewallet(userId, orderId);
    console.log(updatewallet, "updated wallet data");
    res.redirect("/orderPlaced");
  } catch (error) { }
}


const loadWallet = async (req, res) => {
  try {
      const userId = req.session.user_id;
      const walletDetails = await userHelpers.getWalletDetails(userId);
      const creditOrderDetails = await userHelpers.creditOrderDetails(userId);
      const debitOrderDetails = await userHelpers.debitOrderDetails(userId);

      // Merge credit and debit order details into a single array
      const orderDetails = [...creditOrderDetails, ...debitOrderDetails];

      // Sort the merged order details by date and time in descending order
      orderDetails.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Pagination logic
      const currentPage = parseInt(req.query.page) || 1;
      const PAGE_SIZE = 5;

      const totalItems = orderDetails.length;
      const totalPages = Math.ceil(totalItems / PAGE_SIZE);

      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedOrderDetails = orderDetails.slice(startIndex, endIndex);

      const hasPrev = currentPage > 1;
      const hasNext = currentPage < totalPages;

      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
          pages.push({
              number: i,
              current: i === currentPage,
          });
      }

      res.render('users/wallet', {
          walletDetails,
          orderDetails: paginatedOrderDetails,
          showPagination: totalItems > PAGE_SIZE,
          hasPrev,
          prevPage: currentPage - 1,
          hasNext,
          nextPage: currentPage + 1,
          pages,
      });
  } catch (error) {
      console.log(error.message);
      res.redirect('/user-error')
  }
};


const submitCheckout = async (req, res) => {
  try {
    console.log("entered placed order routeeeee");
    let userId = req.session.user_id;
    let orderDetails = req.body;
    console.log(orderDetails, "ordeerdetails have reached here");

    let productsOrdered = await productHepler.getProductListForOrders(userId);
    console.log(productsOrdered, "products that are ordered");

    if (productsOrdered) {
      let totalOrderValue = await productHepler.getCartValue(userId);
      console.log(totalOrderValue, "this is the total order value");
      productHepler
        .placingOrder(userId, orderDetails, productsOrdered, totalOrderValue)
        .then(async (orderId) => {
          console.log("successfully reached hereeeeeeeeee");

          if (req.body["paymentMethod"] === "COD") {
            console.log("cod_is true here");
            res.json({ COD_CHECKOUT: true });
          } else if (req.body["paymentMethod"] === "ONLINE") {
            productHepler
              .generateRazorpayOrder(orderId, totalOrderValue)
              .then(async (razorpayOrderDetails) => {
                console.log(
                  razorpayOrderDetails,
                  "razorpayOrderDetails reached here"
                );
                const user = await User.findById({ _id: userId }).lean();
                res.json({
                  ONLINE_CHECKOUT: true,
                  userDetails: user,
                  userOrderRequestData: orderDetails,
                  orderDetails: razorpayOrderDetails,
                  razorpayKeyId: "rzp_test_lttgGofXL0RV96",

                });
              });
          } else if (req.body["paymentMethod"] === "WALLET") {
            console.log("wallet true");
            const walletBalance = await userHelpers.walletBalance(userId);
            console.log(walletBalance, "wallet balance is this");
            if (walletBalance >= totalOrderValue) {
              productHepler
                .placingOrder(
                  userId,
                  orderDetails,
                  productsOrdered,
                  totalOrderValue
                )
                .then(async (orderId, error) => {
                  res.json({ WALLET_CHECKOUT: true, orderId });
                });
            } else {
              res.json({ error: "Insufficient balance." });
            }
          } else {
            res.json({ paymentStatus: false });
          }
        });
    } else {
      res.json({ checkoutStatus: false });
    }
  } catch (error) {
    console.log(error.message);
  }
}


const verifyPayment = async (req, res) => {
  userHelpers.verifyOnlinePayment(req.body).then(() => {
    let receiptId = req.body['serverOrderDetails[receipt]'];

    let paymentSuccess = true;
    userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(() => {
      // Sending the receiptId to the above userHelper to modify the order status in the DB
      // We have set the Receipt Id is same as the orders cart collection ID

      res.json({ status: true });
    })

  }).catch((err) => {
    if (err) {
      console.log(err);

      let paymentSuccess = false;
      userHelpers.updateOnlineOrderPaymentStatus(receiptId, paymentSuccess).then(() => {
        // Sending the receiptId to the above userHelper to modify the order status in the DB
        // We have set the Receipt Id is same as the orders cart collection ID

        res.json({ status: false });
      })
    }
  })
}



const loadOrders = async (req, res) => {
  try {
    console.log("entered the order loading");
    const userId = req.session.user_id;
    console.log(userId, "this is userid");
    const orderDetails = await Order.find({ userId: userId }).sort({ date: -1 }).lean();
    console.log(orderDetails, "order details are here");

    const orderHistory = orderDetails.map((history) => {
      let createdOnIST = moment(history.date)
        .tz("Asia/Kolkata")
        .format("DD-MM-YYYY h:mm A");

      return { ...history, date: createdOnIST };
    });
    console.log(orderHistory, "order history");

    res.render("users/order-page", {
      orderDetails: orderHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading orders. Please try again later.");
  }
};


const loadOrdersView = async (req, res) => {
  try {
    const orderId = req.query.id;

    const userId = req.session.user_id

    console.log(orderId, 'orderId when loading page');
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
        status: order.orderStatus,

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
    console.log(cancellationStatus, 'cancellationStatus');

    console.log(subtotal, 'subtotal');


    console.log(orderDetails, 'orderDetails');
    console.log(deliveryAddress, 'deliveryAddress');

    res.render('users/viewOrder', {
      orderDetails: orderDetails,
      deliveryAddress: deliveryAddress,
      subtotal: subtotal,

      orderId: orderId,
      orderDate: createdOnIST,
      cancellationStatus: cancellationStatus,


    });
  } catch (error) {
    throw new Error(error);
  }
}

const cancelOrder = async (req, res) => {
  try {
    const id = req.body.orderId;
    const url = '/viewOrder?id=' + id;

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { orderStatus: "Pending", cancellationStatus: "cancellation requested" } },
      { new: true }
    ).exec();


   

    res.redirect(url);
  } catch (error) {
    console.log(error.message);
  }
};


module.exports = {
  insertUser,
  loadSignup,
  successPage,
  verifyMail,
  loadwelcome,
  loadlogin,
  verifyLogin,
  forgetLoad,
  sendResetLink,

  loadindex,
  loadAbout,
  loadContact,
  loadprofile,
  editLoad,

  userLogout,
  forgetPasswordLoad,
  resetPassword,
  verificationLoad,
  sendVerificationLink,
  otpLoad,
  sendOtp,
  verifyOtp,
  loadVerifyOtp,
  viewPage,
  addToCart,
  getCart,
  changeQuantity,

  loadAddress,
  addressList,
  deletingAddress,
  editAddress,
  settingAsDefault,
  changeAddress,

  checkoutLoad,
  orderFailed,
  orderPlaced,
  walletOrder,
  loadWallet,
  submitCheckout,
  verifyPayment,


  loadOrders,
  loadOrdersView,
  cancelOrder
};