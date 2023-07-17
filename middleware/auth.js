const User = require('../models/userModel');

// const isLogin = async (req, res, next) => {
//   try {
//     if (req.session.user_id) {
//       const userData = await User.findById(req.session.user_id);
//       if (userData.blocked) {
//         req.session.destroy();
//         return res.redirect("/login");
//       }else{}
//     } else {
//       return res.redirect("/login");
//     }
//     next();
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const userData = await User.findById(req.session.user_id);
      if (userData && !userData.blocked) {
        next(); // Proceed to the next middleware
      } else {
        req.session.destroy();
        return res.redirect("/login");
      }
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};



const isLogOut = async (req, res, next) => {
  try {
    if (req.session.user_id && req.session.blocked === false) {
      res.redirect("/home");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};
const otpLog = async (req, res, next) => {
  try {
    if (req.session.user._id) {
      res.redirect("/home");
    }
    next();
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  isLogin,
  isLogOut,
  otpLog
};