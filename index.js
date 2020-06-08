const express=require("express");
const bodyparser= require('body-parser');
const hbs = require('hbs');
const session=require("express-session");
const app=express();

app.use(session({secret:"1234asdf",resave:false, saveUninitialized:false}))
app.set('view engine', 'hbs');

///     DATABASE CONNECTION     ///
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://admin:ADMIN@cluster0786-eve5j.mongodb.net/FIRST?retryWrites=true&w=majority";

const homeroute=require('./routes/homepage');  // routing homepage

app.use("/logged",homeroute);  //logged in routes
app.use(express.static('images'));
app.use(express.static('css'));  //css files
app.use(bodyparser.urlencoded({extended:true}));
app.get("/", function(req,res){
    //result.sendFile(__dirname+"/index.html")
    res.render("main")
})//  e:\rentingSystem\backend

// verfying user 
app.post("/login", function(req,res){
  var userid=parseInt(req.body.name);   // username
  var pswd=req.body.password;   // password
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var d = new Date();
  var date=  days[d.getDay()]+" "+ d.getDate()+"-"+months[d.getMonth()]+"-"+d.getFullYear();
  //data

  var name;
  var water;
  var baserent;
  var security;
  var electricity;
  var maintenance;
  var approvCount;
  var aprov;
  var pendPay;
  var pendPayCount;
  var recPay;
  var recPayCount;
  var totaltenant;

 // console.log("Username: "+username," password: "+pswd)
  MongoClient.connect(url, {useUnifiedTopology:true},function(err,db){
    if(err) throw err;
    var dbo=db.db("renting");
    dbo.collection("landlord").find( {landlordID:userid,pswd: pswd},).toArray(function(err,result){
      if(err) throw err;
      if(result.length==0)
      {
        console.log("User not found result: ")
        res.render("main",{message: "INCORRECT credentials"})
      }
      else{
        req.session.userid=parseInt(req.body.name);   // username
        req.session.pswd=req.body.password;
        console.log("user found successful ");
        name=result[0].fname;
        console.log("name: "+name)
        console.log(result);
        
        ///---------- FILLING RESULTS-------------////////////////////
          //name=result[0].fname;
          baserent=result[0].baserent
          water= result[0].water
          electricity=result[0].electricity
          security=result[0].security
          maintenance=result[0].maintenance
      }
    })
    console.log("req ses uid: "+req.session.userid)
    if(req.session.userid==undefined)
    {     console.log("getting rest all data")
          // pending approval count
    dbo.collection("tenant").find({verified:false}).count(function(err,result){
      if (err) throw err;
      console.log("Pending approval Tenants count  "+result);
      approvCount=result;
    })  //user approvals name
    dbo.collection("tenant").find({verified:false}, {projection: {fname:1, _id:0}}).toArray(function(err,result){
      if (err) throw err;
      console.log("Pending approval Tenants list: ");
      console.log(result);
      aprov=result;
      //console.log(aprov)
    }) // pending payments
    dbo.collection("transaction").find( {landlordID:userid , paidON: null}, {projection: {tid:1, tenantID:1, _id:0}}).toArray( function(err,result){
      if(err) throw err;
      console.log("pending payments : ")
      console.log(result)
      pendPay=result;
      console.log("pending payments COUNT : ")
      console.log(result.length)
      pendPayCount=result.length;
    })
    // recieved payments
    dbo.collection("transaction").find( {paidON: {$ne:null}}, {projection: {tid:1, tenantID:1, _id:0}}).toArray( function(err,result){
      if(err) throw err;
      console.log("Recieved payments: ")
      console.log(result)
      recPay=result;
      console.log("RECIEVED payments COUNT : ")
      console.log(result.length)
      recPayCount=result.length;
    })
    dbo.collection("tenant").find ({ verified: true}).count(function(err,result){
      console.log("Total verified Tenants: ")
      console.log(result);
      totaltenant=result;

      //  data populating 
  res.render("land",
  {
    username:name,
    userid:userid ,
    baserent:baserent,
    water:water,
    electricity:electricity,
    security:security,
    maintenance:maintenance,
    date:date,
    recpaycount:recPayCount,
    penpaycount:pendPayCount,
    totalprofit:"",
    tenantcount:totaltenant,
    approvalcount:approvCount,
    pendpay:pendPay,
    aprov:aprov,
    recpay:recPay
  })
    })

  }

    
  })
  
  
})


///  LISITING SERVER  DONT EDIT   //
app.listen(3000, function(req,result){
    console.log(" Server up and running:: http://localhost:3000")
})