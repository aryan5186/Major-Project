const mongoose=require("mongoose")

const Schema=mongoose.Schema;

const Review = require("./review.js")

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String, 
    image: {
        url: String,
        filename: String, 
    },
    price: Number,
    location: String,
    country: String, 
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner: { 
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    geometry: {
     type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
     },
     coordinates: {
      type: [Number],
      required: true
     }
    },
     category: [String],
});
//yeh ek mongoose middle ware jisko humne add kaar diya

//isse hum listing ko delete karne baad reviews wale models kain ander sain
//review ko bhi delte kaar sakte hain 
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id: {$in : listing.reviews}} )
  }
})
const Listing=mongoose.model("Listing",listingSchema)
module.exports= Listing