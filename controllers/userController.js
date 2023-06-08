const User = require('../models/userModel');
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const config = require("../config/config")

const securePassword =async(password)=>{
  try{
   const passwordHash= await bcrypt.hash(password,10)
   return passwordHash;

  }catch (error){
    console.log(error.message)

  }

}

//for send mail
const sendVerifyMail = async(name,email,user_id)=>{
  try {
    const transporter = nodemailer.createTransport({
      host:'smtp.ethereal.email',
      port:587,
      secure:false,
      requireTls:true,
      auth:{
        user:config.emailUser,
        pass:config.emailPassword,
      },
    });

    const mailOption ={
      from:'fayizcj94@gmail.com',
      to:email,
      subject:'For Verify the  mail',
      html:
      '<p>Hi, '+
      name+
      ', Please click here  to <a href="http://localhost:3000/verify?id='+
      user_id+
      '">verify</a> your mail.</p>'
    }
    transporter.sendMail(mailOption,function(error,info){
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-",info.response);
        
      }
    })
    
  } catch (error) {
    console.log(error.message);
    
  }
}

const insertUser = async (req, res) => {
  try {
    const spassword =await securePassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password:spassword,
    });

    const userData = await user.save();
    if (userData) {
      sendVerifyMail(req.body.name,req.body.email,userData._id)
      res.redirect("/success"); // Redirect to the success page
    } else {
      res.render("users/signup", { message: "Your registration has failed" });
    }
  } catch (error) {
    res.render("error", { error }); // Render the error page with the error object
  }
};

const loadSignup = async (req, res) => {
  try {
    res.render("users/signup");
  } catch (error) {
    res.render("error", { error }); // Render the error page with the error object
  }
};

const successPage = async (req, res) => {
  try {
    res.render("users/success", { signInPage: true }); // Pass signInPage variable
  } catch (error) {
    res.render("error", { error }); // Render the error page with the error object
  }
};

const signInPage = async (req, res) => {
  try {
    res.render("users/signin"); // Render the sign-in page
  } catch (error) {
    res.render("error", { error }); // Render the error page with the error object
  }
};

const verifyMail =async(req,res)=>{
  try {

    const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});

    console.log(updateInfo);
    res.render("users/email-verified")
    
  } catch (error) {
    console.log(error.message);
    
  }
}


module.exports = {
  insertUser,
  loadSignup,
  successPage,
  signInPage, // Add the signInPage function
  verifyMail,
};
