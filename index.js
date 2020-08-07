require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
require("./database");
const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const userRoute=require('./routes/landlord');
const landlordRoute=require('./routes/user');
const path=require("path")
var MemoryStore = require('memorystore')(session)
const expHbs=require("express-handlebars")
const helper=require("handlebars-helpers")();


const app=express();

app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret:"1234asdf",
  resave:false,
  saveUninitialized:false,
  maxAge:3600000}
  ))

var hbs=expHbs.create({
  extname:"hbs",
  defaultLayout:"main",
  layoutsDir:path.join(__dirname,"views/layout"),
  helpers: helper,
  partialsDir:path.join(__dirname,"views/partials"),
})
app.engine("hbs",hbs.engine)
app.set('view engine', 'hbs');

app.use(userRoute);
app.use(landlordRoute);
app.use(express.static(path.join(__dirname,"./images")));
app.use(express.static(path.join(__dirname,"./css")));
app.use(express.static(path.join(__dirname,"./script")));
app.use(express.static(path.join(__dirname,"./fonts")));
app.use(express.static(path.join(__dirname,"./icons")));
app.use(express.static(path.join(__dirname,"./js")));

app.use(bodyparser.urlencoded({extended:true}));

app.get("/", async (req,res)=>{
    res.render("first",{
      layout: false
    })
})
app.get("/test", async (req,res)=>{
   // var ans=await tenant.find({}).lean()
   // console.log(ans[0])
  res.render("test",{
    title:"Wroking",
    // res:ans,
    // answer: {
    //   name:"Fri Jul 31 2020 10:46:55 GMT+0530 (India Standard Time)"
    // }
  })
})
///  LISITING SERVER  DONT EDIT   //
app.listen(process.env.PORT, function(req,result){
    console.log(" Server up and running:: http://localhost:3000")
})