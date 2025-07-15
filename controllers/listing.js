const { ConnectionStates } = require("mongoose");
const Listing = require("../Models/listing")
const { listingSchema } = require("../schema.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); 
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken: mapToken});


module.exports.index=async (req,res)=>{
    const searchQuery = req.query.q;
    const categoryFilter = req.query.category;
    let allListings;  
    if(searchQuery){
       // ✅ Search + Category filter
      if (categoryFilter) {
        allListings=await Listing.find({
         $and: [
          {
           $or: [
        { title: { $regex: searchQuery, $options: 'i'  } },
        { location: { $regex: searchQuery, $options: 'i'  } },
        { country: { $regex: searchQuery, $options: 'i'  } }
           ]  
      },
       { category: { $regex: categoryFilter, $options: 'i' } }, 
    ]
    });
    }
     else{
       // ✅ Only Search filter
      allListings = await Listing.find({
        $or: [
          { title:{ $regex: searchQuery, $options: 'i'  } },
          { location: { $regex: searchQuery, $options: 'i'  }},
          { country:{ $regex: searchQuery, $options: 'i'  } }
        ]
      });
     }
    }
    else{
     if (categoryFilter) {
      allListings = await Listing.find({
        category: { $regex: categoryFilter, $options: 'i' } // ✅ Match partial category
      });
     } else {
      // ✅ No filters — show all
      allListings = await Listing.find({});
     }
    }
  res.render("listings/index.ejs", { allListings, q: searchQuery || '',activeCategory: categoryFilter || '' });
}

module.exports.renderNewForm= (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
  try {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing doesn't Exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {
      listing,
      mapToken: process.env.MAP_TOKEN // ✅ Pass Mapbox token to the EJS view
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
};


module.exports.createListing=async (req, res, next) => {
    let response=await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    })
      .send();
      // console.log(response.body.features[0].geometry);
    let url=req.file.path
    let filename=req.file.filename
    // console.log(url,"..",filename)
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename}
    
    newListing.geometry=response.body.features[0].geometry;
    
    newListing.category = req.body.listing.category;

    let savedListing = await newListing.save()
    console.log(savedListing)

    // if (!newListing.title) {
    //   throw new ExpressError(400, "Title is missing!");
    // }

    // if (!newListing.description) {
    //   throw new ExpressError(400, "description is missing!");
    // }

    // if (!newListing.price) {
    //   throw new ExpressError(400, "Price is missing!");
    // }

    // if (!newListing.location) {
    //   throw new ExpressError(400, "location is missing!");
    // }

    // if (!newListing.country) {
    //   throw new ExpressError(400, "Country is missing!");
    // }
    // await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing doesn't Exist!");
      res.redirect("/listings");
    }
    let OriginalImageUrl=listing.image.url;
    OriginalImageUrl=OriginalImageUrl.replace("/upload","/upload/h_300,w_250")
    res.render("listings/edit.ejs", { listing ,OriginalImageUrl});
}

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    if (!req.body.listing) {
      throw new ExpressError(400, "Send Valid Data for listing");
    }
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   
    if(typeof req.file !== "undefined"){
      let url=req.file.path;
      let filename=req.file.filename;
      listing.image = {url,filename}
      await listing.save()
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

