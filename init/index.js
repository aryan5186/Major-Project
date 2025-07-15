const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../Models/listing.js")

const Mongo_URL="mongodb://127.0.0.1:27017/wanderlust"

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
   initData.data=initData.data.map((obj)=>({...obj,owner: "68299771707e38ed3f77911e"}))
   await Listing.insertMany(initData.data)

   console.log("data was initalized")
}
initDB()