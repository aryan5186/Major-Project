if(process.env.NODE_ENV != "production"){
  require("dotenv").config()
}

console.log(process.env.SECRET) 

const express=require("express")
const app=express()
const mongoose=require("mongoose")
const path=require("path")
const methodOverride=require("method-override")
const ejsMate = require("ejs-mate")
const ExpressError = require("./utils/ExpressError.js")
const session=require("express-session")
const MongoStore = require("connect-mongo");

const flash=require("connect-flash")
const passport=require("passport")
const LocalStrategy=require("passport-local")
const User=require("./Models/user.js")

//iss tarike sain hum apne model ko require karte hain
// const Mongo_Url="mongodb://127.0.0.1:27017/wanderlust"

const dbUrl=process.env.ATLASDB_URL;

const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const user = require("./Models/user.js")

main().then(()=>{
   console.log("Connected to DB")
})
.catch((err)=>{
    console.log(err); 
})

async function main(){
    await mongoose.connect(dbUrl);
}
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));

app.engine("ejs",ejsMate)  
app.use(express.static(path.join(__dirname,"/public")))


const store=MongoStore.create({
    mongoUrl: dbUrl,

    //it is used for encryption
    crypto: {
       secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,  
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.get("/",(req,res)=>{
    res.redirect("/listings");
})


store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})


app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
//hume flash ko routes sain pahle use karna padega

// app.get("/testListing",async (req,res)=>{
//    let sampleListing=new Listing({
//     title: "My New Villa",
//     desc: "By the Beech",
//     price:1200,
//     location:"Calangute,Goa",
//     country: "India",
//    })
//    await sampleListing.save()
//    console.log("sample was saved")
//    res.send("successful testing")
// })

app.use((req,res,next)=>{
   res.locals.success=req.flash("success") 
   res.locals.error=req.flash("error")
//    console.log(res.locals.success)
   res.locals.currUser = req.user;  // <-- add this line
   console.log("Logged in user:", req.user); // Optional debug
   next() 
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     }) 

//   let registerUser= await User.register(fakeUser,"helloworld")
//   res.send(registerUser)
// })
app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter)

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"))
})
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something Went Wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message})
    // res.status(statusCode).send(message)
})
app.listen(8080,()=>{
    console.log("server is listening to port 8080")
}) 