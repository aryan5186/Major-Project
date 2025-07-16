if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

console.log("✅ DB URL:", process.env.ATLASDB_URL); // <--- debug line

const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../Models/listing.js")

const Mongo_URL=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to DB")
})
.catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect(Mongo_URL);
}

const initDB = async ()=>{
   await Listing.deleteMany({})
   //hume key ko access karna hain islye .data likha hain
   initData.data=initData.data.map((obj)=>({...obj,owner: "68763ee71e9f84cc917ecb45"}))
   await Listing.insertMany(initData.data)

   console.log("data was initalized")
}
initDB()