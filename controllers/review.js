const Listing = require("../Models/listing.js");
const Review = require("../Models/review.js");
const { reviewSchema } = require("../schema.js");

module.exports.createReview=async (req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview)
    listing.reviews.push(newReview);

    //database main save kaar denge reviews ko
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/Listings/${listing._id}`);
}

module.exports.destroyReview=async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/Listings/${id}`);
}