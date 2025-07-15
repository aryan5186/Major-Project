const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../Models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer")

const {storage} = require("../cloudConfig.js")
const upload = multer({storage})
 
router
 .route("/")
  //Index Route
  .get(wrapAsync(listingController.index))
  // Create Route  
  .post(
    isLoggedIn, 
    // validateListing,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  )

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);
//new route ko hume upper hi likhna hoga nahi toh /:id isko id ki tarah treat karega

router
  .route("/:id")
  //Show Route
  .get(wrapAsync(listingController.showListing))
  //Update Route
  .put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  //Delete Route
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

 

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
