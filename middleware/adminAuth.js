const { log } = require("handlebars");

const isLogin = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      next();
    } else {
      return res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const islogOut = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      res.redirect("/admin/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = {
  isLogin,
  islogOut,
};
