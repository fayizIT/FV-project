const User = require("../models/userModel");

const insertUser = async(req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: req.body.password,
    });

    const userData = await user.save();
    if(userData){
      res.render("users/signup")
    }else{
      res.render("users/signup",{message:"your registration has been failed"})
    }
    
  } catch (error) {
    res.send(error.message);
  }
};

const loadSignup = async(req,res)=>{
  try {
    res.render('users/signup')
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  insertUser,
  loadSignup
};
