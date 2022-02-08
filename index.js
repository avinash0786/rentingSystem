require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
require("./database");
require("./passport-setup")
const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const transaction=require("./models/transaction")
const notifications=require("./models/notifications")
const passport=require('passport');

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
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
helper.getMonth=function(option){
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var num=option.fn(this);
    return months[num-1];
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
app.use(passport.initialize());
app.use(passport.session())

app.get("/", async (req,res)=>{
    res.render("first",{
      layout: false
    })
})
app.get("/test", async (req,res)=>{
  // let first=new transaction({
  //   tid:1,
  //   amount:0,
  //   landlordID:1,
  //   tenantID:6,
  //   baseRent:1,
  //   water:1,
  //   electricity:1,
  //   maintenance:1,
  //   security:1,
  // })
  // first.save()
    //ok
 transaction.updateMany({tid:{$mod : [2,0]}},{paidON:new Date()})
     .then(d=>{
       console.log(d)
     })
 //  transaction.deleteMany({})
 //      .then(s=>{
 //        console.log(s)
 //      })
  res.render("test",{
    title:"Wroking",
  })
})
//Google auth 2.0
app.get('/auth/google',
    passport.authenticate('google', { scope:
          [ 'email', 'profile' ] }
    ));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
      successRedirect: '/auth/google/success',
      failureRedirect: '/auth/google/failure'
    }));

app.get("/auth/google/success",(req, res) => {
    console.log("Success")
    console.log(req.session)
    console.log(req.user)
    if(req.user.provider){
        console.log("Google user Signup required")
        console.log(req.url)
        if(req.session.landlordLog){
            console.log("Signup landlord")
            console.log(req.user)
            req.session.given_name=req.user.given_name;
            req.session.family_name=req.user.family_name
            req.session.email=req.user.email
            return res.redirect("/landlord-login")
        }
        else {
            console.log("Signup tenant")
            console.log(req.user)
            req.session.tgiven_name=req.user.given_name;
            req.session.tfamily_name=req.user.family_name
            req.session.temail=req.user.email
            return res.redirect("/tenant-login")
        }
    }
    if(req.user.tenantID){
        console.log("Existing Tenant user LOGIN")
        req.session.tenantID=req.user.tenantID;
        req.session.tenantFname=req.user.fname;
        req.session.tanantLname=req.user.lname;
        return res.redirect('/tenant-landing')
    }
    if(req.user.landlordID){
        console.log("Existing Landlord user LOGIN")
        req.session.userID=req.user.landlordID;
        req.session.fname=req.user.fname;
        req.session.lname=req.user.lname;
        return res.redirect('/landlord-landing')
    }

    res.send("Error occured contact admin")
})
app.get("/auth/google/failure",(req, res) => {
    console.log("Failed")
    console.log(req.user)
    console.log(req.session)
    console.log(req.isAuthenticated())
  res.send("login Failed XXXXX")
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