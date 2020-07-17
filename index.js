require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
require("./database");
const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const userRoute=require('./routes/landlord');
const landlordRoute=require('./routes/user');

const app=express();

app.use(session({secret:"1234asdf",resave:false, saveUninitialized:false}))
app.set('view engine', 'hbs');

app.use(userRoute);
app.use(landlordRoute);
app.use(express.static('images'));
app.use(express.static('css'));  //css files
app.use(bodyparser.urlencoded({extended:true}));

app.get("/", async (req,res)=>{
    res.render("all")
})

app.post("/register",function(req,res){
  console.log("registering USER")
  var newID;

  const qq=new Promise((resole,reject)=>{
    landlord.countDocuments( {},function(err,r){
      newID=r+1;
      resole(newID)
    })
  })
  qq.then((a)=>{
    let newlandlord= new landlord({
      landlordID: a,
      fname:  req.body.fname,
      lname:  req.body.lname,
      address:req.body.address,
      pswd:req.body.spassword
    })
    newlandlord.save().then((doc)=>{
      res.render("main",{message2:"SIGNUP SUCCESSFULL ID:"+newID})
    }).catch(err=>{
      console.log(err)
        return res.send("insert error")
    })
  })
})

app.post("/createnewuser", function(req,res){
  console.log("CREATING NEW USER")
  var newID;

  const qq=new Promise((resole,reject)=>{
    tenant.countDocuments( {},function(err,r){
      newID=r+1;
      resole(newID)
    })
  })
  qq.then((a)=>{
    let newtenant= new tenant({
      tenantID:a,
      room:a,
      landlordID: req.session.userid ,
      verified:true,
      fname: req.body.fname,
      lname: req.body.lname,
      email:req.body.email,
      mobile:req.body.mobile,
      pswd: req.body.password
    })
    newtenant.save().then((doc)=>{
      res.render("createuser",{message2:"USER CREATED SUCCESSFULLY ID:"+newID})
    }).catch(err=>{
      console.log(err)
        return res.send("insert error")
    })
  })
})


///  LISITING SERVER  DONT EDIT   //
app.listen(3000, function(req,result){
    console.log(" Server up and running:: http://localhost:3000")
})