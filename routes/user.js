const express = require("express");
const router = express.Router();
const User = require("../Models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js")


router
  .route("/signup")
  .get(userController.renderSignupForm)
  //jis req ko hum database main store karte hain usko hum async likhte hain
  .post(
    wrapAsync(userController.signup)
  )

router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout",userController.logout);
module.exports = router;
  