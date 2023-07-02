const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const Product = require("../models/productModel");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const randomstring = require("randomstring");
const Cart=require("../models/cartModel")
const mongoose = require('mongoose');
const Addresses = require("../models/addressesModel");
const twilio = require("twilio");
const categoryModel = require('../models/categoryModel');
const accountSid = "AC33898e9e5916409727aac0861a79477e";
const authToken = "24d90527a334d4688772e70a8782a38a";
const verifySid = "VA5179ed94458df0af3f9da9ebd4df2360";
const client = require("twilio")(accountSid, authToken);






const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};



const insertUser = async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.render("users/signup", { message: "Passwords do not match" });
    }

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
        ',please click here to <a href="http://localhost:3000/forget-password?token=' +
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
      host: 'smtp.ethereal.email',
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
        ', please click <a href="http://localhost:3000/verify?id=' +
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
    }

    req.session.user_id = userData._id;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.redirect('/home');

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
    const productData =await Product.find({unlist:false}).lean()
    const categoryData =await categoryModel.find({unlist:false}).lean()
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const userData = await User.findById({_id:req.session.user_id})
    res.render('users/index',{user:userData,Product:productData,category:categoryData});
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};

//load profile information

const loadprofile = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const userData = await User.findById({_id:req.session.user_id})
    res.render('users/profile',{user:userData});
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};


// user profile edit and update 

const editLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById(id);

    if (userData) {
      res.render("users/edit", { user: userData });
    } else {
      res.redirect('/home');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const user_id = req.query.id; // Update the parameter name to 'id'

    if (req.file) {
      await User.findByIdAndUpdate({ _id: user_id }, {
        $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile }
      });
    } else {
      await User.findByIdAndUpdate({ _id: user_id }, {
        $set: { name: req.body.name, email: req.body.email, mobile: req.body.mobile }
      });
    }

    res.redirect('/home');
  } catch (error) {
    console.log(error.message);
  }
};



//logout 
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};


// after verify to rseting password in mail goes through this page 
const forgetPasswordLoad = async(req,res)=>{
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({token:token});
    if (tokenData) {
      res.render("users/forget-password",{user_id: tokenData._id});
      
    } else {     
      res.render("error",{message:"Token is invalid."})
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
    },{ new: true },);
    console.log("reseetting done");
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};


    

//for verification send link

const verificationLoad = async (req, res)=>{
  try {
    res.render("users/verification")
    
  } catch (error) {
    console.log(error.message);
    
  }
}

const sendVerificationLink = async (req,res)=>{
  try {
    const email =req.body.email;
    const userData = await User.findOne({email:email});
    if(userData){

      sendVerifyMail(userData.name, userData.email,userData._id);
      res.render('users/verification',{message:"Reset verification mail sent your  mail id,please check"})

    }else{
      res.render('users/verification',{message:"This email is not exist"})
    }
  } catch (error) {
    console.log(error.message);
    
  }
}

//otp verification
const otpLoad = async(req,res)=>{
  try {
    res.render("users/otp-verify")

    
  } catch (error) {

    console.log(error.message);
    
  }
}


//   try {

//   client.verify.v2
//   .services(verifySid)
//   .verifications.create({ to: "+919946340822", channel: "sms" })
//   .then((verification) => console.log(verification.status))

    
//   } catch (error) {
//     console.log(error.message);
    
//   }
const sendOtp = async (req, res) => {

  console.log("startingggggg")
  try {
    const { mobile } = req.body;
    

  

    const user = await User.findOne({ mobile: mobile });
    req.session = user;

    if (!user) {
      res.status(401).json({ message: "user not found" });
    } else {
      const client = new twilio(process.env.accountSid, process.env.authToken);

      client.verify
        .services(verifySid)
        .verifications.create({ to: "+91" + user.mobile, channel: "sms" })
        .then((verification) => {
          console.log(verification.status);
          res.render("users/otp-enter");
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ message: "Internal server error" });
        });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp= async (req,res)=>{
  try {
    const userMobile = "+91" + req.session.userMobile;
    console.log(userMobile);
    const otp = req.body.otp;
    client.verify.v2
      .services(process.env.verifySid)
      .verificationChecks.create({ to: User.mobile, code: otp })
      .then(async (verification_check) => {
        if (verification_check.status === "approved") {
          console.log(verification_check.status);
          let user = await User.findOne({ mobile: req.session.userMobile });

          req.session.user_id = user._id;

          console.log(req.session.user_id);

          res.redirect("/home");
        } else {
          res.render("users/otp-enter", {
            message: "invalid OTP"
          });
        }
      });
  } catch (error) {
    throw new Error(error.message);
  }
}


const viewPage =  async (req, res) => {
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




const  addToCart= async (req, res) => {
  try {
    console.log("cart loading");
    const proId = req.body.productId;
    console.log(proId,"is here setting");
          

    let cart = await Cart.findOne({ user_id: req.session.user_id });
   
 

    if (!cart) {
      let newCart = new Cart({ user_id: req.session.user_id, products: [] });
      await newCart.save();
      cart = newCart;
    }
   
    const existingProductIndex = cart.products.findIndex((product) => {0
      return product.productId.toString() === proId;
    });

    if (existingProductIndex === -1) {
      const product = await Product.findById(proId).lean();
      console.log(proId);
      const total = product.price; 
      cart.products.push({
        productId: proId,
        kg: 1,
        total, 
      });
    } else {
      cart.products[existingProductIndex].kg += 1;
      const product = await Product.findById(proId).lean();
      cart.products[existingProductIndex].total += product.price; // Update the total by adding the price of the product
    }

    // Calculate the updated total amount for the cart
    cart.total = cart.products.reduce((total, product) => {
      return total + product.total;
    }, 0);
    

    await cart.save();
   

    // Send a response indicating success or any other relevant data
    res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    // Handle any errors that occurred during the process
    res.status(500).json({ error: error.message });
  }
}




const getCart = async (req, res) =>{
  try {


    console.log("entered loading cart page");
    const check = await Cart.findOne({user_id: req.session.user_id });

    console.log("checking no 1", check, "this is cart");
    if (check) {
      const cart = await Cart.findOne({ user_id: req.session.user_id })
        .populate({
          path: "products.productId",
        })
        .lean()
        .exec();
      console.log(cart, "checking no 2");
      console.log("products", cart.products);
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
      console.log("passing products data is :", products);

      const total = products.reduce(
        (sum, product) => sum + Number(product.total),
        0
      );
      console.log(total);

      const finalAmount = total;

      // Get the total count of products
      const totalCount = products.length;
      console.log(totalCount);
      res.render("users/cart", {
        
        products,
        total,
        totalCount,
        subtotal: total,
        finalAmount,
      });
    } else {
      res.render("users/cart");
    }

    
  } catch (error) {
    throw new Error(error.message);
    
  }
}


const changeQuantity = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);
    const kg = req.body.kg;
    const count = req.body.count;

    const cart = await Cart.findOneAndUpdate(
      { user_id: userId, 'products.productId': productId },
      { $inc: { 'products.$.kg': count } },
      { new: true }
    ).populate('products.productId');

    if (!cart || !cart.products) {
      throw new Error('Cart not found');
    }

    const updatedProduct = cart.products.find(product => product.productId.equals(productId));
    if (!updatedProduct) {
      throw new Error('Product not found in cart');
    }

    updatedProduct.total = updatedProduct.productId.price * updatedProduct.kg;

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
      subtotal: subtotal
    };

    return res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const checkoutLoad = async(req,res)=>{
//   try {
//     console.log("entered checkout load");
//     const userId = req.session.user_id;

//     const defaultAddress = await Addresses.findOne(
//       {
//         user_id: userId,
//         "addresses.is_default": true,
//       },
//       { "addresses.$": 1 }
//     ).lean();
//     console.log(defaultAddress, "eeeeeeeeeeeeeeeeeeeeee");
//     const addressDoc = await Addresses.findOne({ user_id: userId }).lean();
//     const addressArray = addressDoc.addresses;
//     console.log(addressArray, "arrayyyy");
//     const filteredAddresses = addressArray.filter(
//       (address) => !address.is_default
//     );
//     console.log(filteredAddresses, "filtered address");

//     const cart = await Cart.findOne({ User_id: userId })
//       .populate({
//         path: "products.productId",
//       })
//       .lean()
//       .exec();

//     const products = cart.products.map((product) => {
//       const total =
//         Number(product.quantity) * Number(product.productId.price);
//       return {
//         _id: product.productId._id.toString(),
//         brand: product.productId.brand,
//         productname: product.productId.productname,
//         category: product.productId.category,
//         images: product.productId.images,
//         price: product.productId.price,
//         description: product.productId.description,
//         quantity: product.quantity,
//         total,
//         user_id: req.session.user_id,
//       };
//     });
//     console.log(products, "products.........................");
//     const total = products.reduce(
//       (sum, product) => sum + Number(product.total),
//       0
//     );
//     const finalAmount = total;
//     const count = products.length;
//     res.render("users/checkout", {
//       defaultAddress: defaultAddress.addresses[0],
//       filteredAddresses: filteredAddresses,
//       products,
//       total,
//       count,
//       subtotal: total,
//       finalAmount,
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// };



const checkoutLoad = async(req,res)=>{
  try {
    res.render("users/checkout")
    
  } catch (error) {
    console.log(error.message);
    
  }
}





// const loadAddress = async (req, res) => {
//   try {
    // console.log("address loadingggggggggggggg");
    // const userId = req.session.user_id;
    // // console.log(userId, "kkkkkkkkkkkkkkkkkkkkk");
    // const userAddress = await Addresses.findOne({ user_id: userId })
    //   .lean()
    //   .exec();
    // console.log(userAddress, "userAddressss");
    // if (userAddress) {
    //   if (userAddress.addresses.length === 1) {
    //     userAddress.addresses[0].is_default = true;
    //   }

    //   const addressDetails = userAddress.addresses.map((address) => {
    //     return {
    //       name: address.name,
    //       mobile: address.mobile,
    //       address: address.address,
    //       city: address.city,
    //       state: address.state,
    //       pincode: address.pincode,
    //       _id: address._id,
    //       is_default: address.is_default,
    //     };
    //   });

//       console.log(addressDetails, "addressdetails");
//       res.render("users/address"); // Provide the template name and data object as arguments
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };


const loadAddress = async (req, res) => {
  try {
    res.render("users/address")
    
  } catch (error) {
    console.log(error.message);
    
  }
}







// const addressList = async (req, res) => {
//   try {
//     const userId = req.session.user_id;
//     const name = req.body.name;
//     const mobile = req.body.mobile;
//     const city = req.body.city;
//     const state = req.body.state;
//     const pincode = req.body.pincode;
//     const address = req.body.address;
//     console.log(name);

//     console.log(city);
//     console.log(state);
//     console.log(pincode);
//     const newAddress = {
//       name: name,
//       mobile: mobile,
//       address: address,
//       city: city,
//       state: state,
//       pincode: pincode,
//       is_default: false,
//     };

//     let userAddress = await Addresses.findOne({ user_id: userId });
//     // console.log(userAddress, "useraddresssssss");
//     if (!userAddress) {
//       newAddress.is_default = true;
//       userAddress = new Addresses({ user_id: userId, addresses: [newAddress] });
//     } else {
//       userAddress.addresses.push(newAddress);
//       if (userAddress.addresses.length === 1) {
//         userAddress.addresses[0].is_default = true;
//       }
//     }

//     await userAddress.save();
//     console.log(userAddress, "useraddress");

//     res.redirect("/address");
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const deletingAddress = async (req, res) => {
//   try {
//     const id = req.query.id;
//     const userId = req.session.user_id;

//     const address = await Addresses.findOne({ user_id: userId });

//     const deletedAddress = address.addresses.find(
//       (addr) => addr._id.toString() === id
//     );
//     console.log(deletedAddress, "deletedAddress");
//     const isDefaultAddress = deletedAddress && deletedAddress.is_default;
//     console.log(isDefaultAddress, "isDefaultAddress");

//     address.addresses = address.addresses.filter(
//       (addr) => addr._id.toString() !== id
//     );

//     if (isDefaultAddress && address.addresses.length > 0) {
//       const newDefaultAddress = address.addresses.find(
//         (addr) => addr._id.toString() !== id
//       );
//       if (newDefaultAddress) {
//         newDefaultAddress.is_default = true;
//       }
//       console.log(newDefaultAddress, "newDefaultAddress");
//     }

//     // Save the updated address
//     await address.save();
//     res.redirect("/address");
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };
// const editAddress = async (req, res) => {
//   try {
//     console.log("edit address entering");
//     const userId = req.session.user_id;
//     const id = req.body._id;
//     console.log(id, "kkkkkkkkkkkkkkkkkkkkkkk");
//     const name = req.body.name;
//     const mobile = req.body.mobile;
//     const address = req.body.address;
//     const city = req.body.city;
//     const state = req.body.state;
//     const pincode = req.body.pincode;

//     const updatedAddress = await Addresses.findOneAndUpdate(
//       { user_id: userId, "addresses._id": id },
//       {
//         $set: {
//           "addresses.$.name": name,
//           "addresses.$.mobile": mobile,
//           "addresses.$.address": address,
//           "addresses.$.city": city,
//           "addresses.$.state": state,
//           "addresses.$.pincode": pincode,
//         },
//       },
//       { new: true }
//     );
//     console.log(updatedAddress, "updatedAddresssssss");
//     if (updatedAddress) {
//       console.log("Address updated successfully:", updatedAddress);
//       res.redirect("/address");
//     } else {
//       console.log("Address not found or not updated");
//       res.redirect("/address");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const settingAsDefault = async (req, res) => {
//   try {
//     const addressId = req.body.addressId;
//     const userId = req.session.user_id;
//     console.log(addressId, "addressIdkkkk");
//     // Find the current default address and unset its "isDefault" flag
//     const old = await Addresses.findOneAndUpdate(
//       { user_id: userId, "addresses.is_default": true },
//       { $set: { "addresses.$.is_default": false } }
//     );
//     console.log(old, "oldddddddddd");
//     // Set the selected addresses as the new default addresses
//     const defaultAddress = await Addresses.findOneAndUpdate(
//       { user_id: userId, "addresses._id": addressId },
//       { $set: { "addresses.$.is_default": true } }
//     );
//     console.log(defaultAddress, "uuuuuuuuuuuuuuuuuuuuu");
//     const response = {
//       setDefault: true,
//     };

//     res.json({ status: true });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to set addresses as default" });
//   }
// };










module.exports = {
  insertUser,
  loadSignup,
  successPage,
  verifyMail,
  loadlogin,
  verifyLogin,
  forgetLoad,
  sendResetLink,
  loadindex,
  loadprofile,
  editLoad,
  updateProfile,
  userLogout,
  forgetPasswordLoad,
  resetPassword,
  verificationLoad,
  sendVerificationLink,
  otpLoad,
  sendOtp,
  verifyOtp,
  viewPage,
  addToCart,
  getCart,
  changeQuantity,
  checkoutLoad,
  loadAddress,
  // editAddress,
  // deletingAddress,
  // settingAsDefault,
  // addressList,
 
  
    
};