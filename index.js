require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
require("./database");
const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const transaction=require("./models/transaction")
const userRoute=require('./routes/landlord');
const landlordRoute=require('./routes/user');
const path=require("path")
var MemoryStore = require('memorystore')(session)
const expHbs=require("express-handlebars")
var moment = require('moment');
var tz=require("moment-timezone")
const helper=require("handlebars-helpers")();
const EmailService = require('./emailService')



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

helper.convLocal=function(option){
  var da=option.fn(this);
    return moment(da).tz('Asia/Kolkata').format("LLLL");
}
helper.makeBold=function(option){
  return "<strong>"+ option.fn(this)+"<strong>";
}

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
  // transaction.deleteMany({tenantID:5}).then(c=>{
  //   console.log("Delete start: ")
  //   console.log(c)
  //     }
  // )
  // console.log("Testing get")
  // console.log(Date.toString())
  // var emailname=req.query.email;
  // var text=req.query.text;
  // var arr=[...Array(50).keys()]
  res.render("test",{
    title:"Wroking",
  })
})

app.get('/tenantGet',function (req,res) {
  console.log('Autocomplete get')
  var regx=new RegExp(req.query["term"],"i");
  var tena=tenant.find({fname:regx,landlordID:parseInt(req.session.userID)},{fname:1,lname:1,_id:0,tenantID:1}).sort({"updated_at": -1}).sort({"created_at":-1}).limit(5);
  tena.exec(function (err,data) {
  var result=[];
  if(!err){
    if(data && data.length && data.length>0){
      data.forEach(user=>{
        let obj={
          label:"ID: "+user.tenantID+" "+user.fname+" "+user.lname,
        };
        result.push(obj);
      });
    }
    res.jsonp(result);
  }
  })
})
///  LISITING SERVER  DONT EDIT   //
app.listen(process.env.PORT, function(req,result){
    console.log(" Server up and running:: http://localhost:3000")
})