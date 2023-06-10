const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const async = require('hbs/lib/async');

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

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

    const mailOptions= {
      from: "fayizcj94@gmail.com",
      to: email,
      subject: "to verfiy mail",
      html:
        "<p> hi" +
        name +
        ',please click here to <a href="http://localhost:3000/verify?id=' +
        user_id +
        '">verify</a>ypur mail.</p>',
    };

    transporter.sendMail(mailOptions, (error, info)  => {
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

const insertUser = async (req, res) => {
  try {
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

const loadSignup = async (req, res) => {
  try {
    res.render("users/signup");
  } catch (error) {
    res.render("error", { error });
  }
};

const successPage = async (req, res) => {
  try {
    res.render("users/success", { signInPage: true });
  } catch (error) {
    res.render("error", { error });
  }
};

const signInPage = async (req, res) => {
  try {
    res.render("users/login");
  } catch (error) {
    res.render("error", { error });
  }
};

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

const loadSignin = async (req, res) => {
  try {
    res.render("users/login");
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    console.log(userData);
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_verified === 0) {
          res.render('users/login', { message: "Please verify your email" });
        } else {
          req.session.user_id = userData._id;
          res.redirect('/home');
        }
      } else {
        res.render('users/login', { message: "Email and password are incorrect" });
      }
    } else {
      res.render('users/login', { message: "Email and password are incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }
};
const userLogout = async(req,res)=>{
  try {
    req.session.destroy();
    res.redirect('/')
    
  } catch (error) {
    console.log(error.message);
    
  }
};
//forget password code start
const  forgetLoad = async(req,res)=>{
  try {
    res.render('users/forget')
    
  } catch (error) {
    console.log(error.message);
    
  }
};
const sendResetLink = async (req, res) => {
  try {
    const email = req.body.email;
    // Code for sending reset password link
    // ...
    res.render('reset_link_sent');
  } catch (error) {
    console.log(error.message);
    res.render('error', { error });
  }
};

const loadindex = async (req, res) => {
  try {
    res.render('users/index');
  } catch (error) {
    console.log(error.message);
    res.render("error", { error });
  }

 
};




module.exports = {
  insertUser,
  loadSignup,
  successPage,
  signInPage,
  verifyMail,
  loadSignin,
  verifyLogin,
  loadindex,
  userLogout,
  forgetLoad,
  sendResetLink,
};
