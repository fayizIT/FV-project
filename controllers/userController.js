
const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const randomstring = require("randomstring");

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

//for send mail
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

const sendResetpasswordmail = async (name, email, token) => {
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
      from: config.emailUser,
      to: email,
      subject: "Reset Your Password",
      html:
        "<p>Hi " +
        name +
        ', please click <a href="http://localhost:3000/forget-password?token=' +
        token +
        '">here</a> to reset your password.</p>',
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
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const userData = await User.findById({_id:req.session.user_id})
    res.render('users/index',{user:userData});
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
      res.render("users/forget-password",{user_id:tokenData._id});
      
    } else {     
      res.render("error",{message:"Token is invalid."})
    }
    
  } catch (error) {
    console.log(err.message);
    
  }
}


// reseting the password
const resetPassword = async (req,res)=>{
  try {
    const password = req.body.password;
    const user_id =req.body.user_id;

    const secure_Password = await securePassword(password);

    const updatedData = await User.findByIdAndUpdate(
      user_id,
      { password: secure_Password, token: "" },
      { new: true } // Add this option to return the updated document
    );

    if (updatedData) {
      // Render the success template with the updated password
      res.render("users/forget-password", { password: password });
    } else {
      // Handle the case when the user is not found or the update fails
      res.render("error", { message: "Failed to reset the password" });
    }
  } catch (error) {
    console.log(error.message); // Log the error message if an error occurs
    res.render("error", { message: "An error occurred while resetting the password" });
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
    
};

