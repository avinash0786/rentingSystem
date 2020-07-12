require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const hbs = require('hbs');
const session=require("express-session");
require("./database");
const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const transaction=require("./models/transaction")
const val = require("express-validator")
const url=process.env.DB_URL;

const userRoute=require('./routes/landlord');  // routing user
const landlordRoute=require('./routes/user');  // routing landlord

const app=express();

app.use(session({secret:"1234asdf",resave:false, saveUninitialized:false}))
app.set('view engine', 'hbs');

///     DATABASE CONNECTION     ///
var MongoClient = require('mongodb').MongoClient;


app.use(userRoute);  //USER routes
app.use(landlordRoute);  //LANDLORD routes

app.use(express.static('images'));
app.use(express.static('css'));  //css files
app.use(bodyparser.urlencoded({extended:true}));

app.get("/", function(req,res){
    res.render("main")
})


app.get("/generatebills",(req,res)=>{// generating bills
  //we first need to check if bill is generated for this month
  var d = new Date();
  console.log(d)
  res.render("generatebill" ,{success:""})
})

app.post("/generatebills",(req,res)=>{
  console.log("Request body val "+req.body.selection)


  res.send("waiting..")
  //return res.redirect('/admin');
})

//landlord signup
app.post("/register",function(req,res){
//getting new ID of landlord 
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

//creating new user by landlord
app.get("/createuser", function(req,res){
  res.render("createuser")
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
  var pendtenantId
  var pednamearr=[]
  var pendnames;
  var recnamearr=[]
  var recnames;
 // console.log("Username: "+username," password: "+pswd)
  MongoClient.connect(url, {useUnifiedTopology:true},function(err,db){
    if(err) throw err;
    var dbo=db.db("renting");

    //promis
    const pro=new Promise( (resolve, reject)=>{
      dbo.collection("landlord").find( {landlordID:userid,pswd: pswd},).toArray(function(err,result){
        if(err) throw err;
        if(result.length==0)
        {
          console.log("User not found result: ")
          res.render("main",{message: "INCORRECT credentials"})
          reject(null);
        }
        else{
          // password check no need as data base only provide data if given pswd is correct
          
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
            resolve(req.session.userid)
        }
      })
    });

    pro.then( (ACTIVE)=>{
    console.log("req ses uid: "+req.session.userid);
    if(req.session.userid!=undefined)   // if session is created successfully
    {     
      console.log("getting rest all data")
          // pending approval count


    /*dbo.collection("tenant").find({verified:false}).count(function(err,result){
      if (err) throw err;
      console.log("Pending approval Tenants count  "+result);
      approvCount=result;
    })  //user approvals name*/

    dbo.collection("tenant").find({landlordID:req.session.userid, verified:false}, {projection: {fname:1, _id:0}}).toArray(function(err,result){
      if (err) throw err;
      console.log("Pending approval Tenants list: ");
      console.log(result);
      aprov=result;
      approvCount=result.length;
      //console.log(aprov)
    }) 

    dbo.collection("tenant").find ({ landlordID:req.session.userid,verified: true}).count(function(err,result){
      console.log("Total verified Tenants: ")
      console.log(result);
      totaltenant=result;
    })

    // pending payments

    const ss=new Promise((resolve,reject)=>{ // promis ceated 
      dbo.collection("transaction").find( {landlordID:req.session.userid, paidON: null}, {projection: {_id:0,tenantID:1,tid:1, dateGenerated:1, amount:1}}).toArray( function(err,result){
        if(err) throw err;
        /*console.log("pending payments : ")
        console.log(result)
        pendPay=result;
        console.log("pending payments COUNT : ")
        console.log(result.length)*/
        
        pendPayCount=result.length;
        //var val=result
        var i;
        for(i=0;i<result.length;i++)
        {
          pednamearr.push(result[i].tenantID);
          var temp=result[i].dateGenerated.toString();
          result[i].dateGenerated=temp.slice(0,15);
        }
        pendtenantId=result
        console.log("PENDING name list and result")
        console.log(pednamearr)
        console.log(pendtenantId)
        resolve(pednamearr)
      })
    });
    ss.then((a)=>{
      // getting names
      dbo.collection('tenant').find({tenantID:{$in:pednamearr}}, {projection:{_id:0, fname:1}}).toArray(function(err,result){
        pendnames=result;
        console.log("pending payments names")
        console.log(pendnames)
        var i=0;
        for (x in pendtenantId){
          pendtenantId[x]['fname']=pendnames[i].fname.toString();
          i++;
        }
        console.log(pendtenantId)
      })

    })
    // recieved payments

    const dd=new Promise((resolve,reject)=>{ // promis ceated 
      dbo.collection("transaction").find( {landlordID:req.session.userid, paidON: {$ne:null}}, {projection: {_id:0,tenantID:1,tid:1, paidON:1, amount:1}}).toArray( function(err,result){
        if(err) throw err;
        
        recPayCount=result.length;
        //var val=result
        var i;
        for(i=0;i<result.length;i++)
        {
          recnamearr.push(result[i].tenantID);
          var temp=result[i].paidON.toString();
          result[i].paidON=temp.slice(0,15);
        }
        rectenantId=result
        console.log(" RECIEVED name list and result")
        console.log(recnamearr)
        console.log(rectenantId)
        resolve(recnamearr)
      })
    });
    dd.then((ba)=>{
      // getting names obj["key3"] = "value3";
      dbo.collection('tenant').find({tenantID:{$in:recnamearr}}, {projection:{_id:0, fname:1}}).toArray(function(err,result){
        recnames=result;
        console.log("recieved  payments names")
        console.log(recnames)
        var i=0;
        for (x in rectenantId){
          rectenantId[x]["fname'"]=recnames[i].fname.toString();
          i++;
        }
        console.log(rectenantId)
        return rectenantId;
      })

    }).then((sv)=>{
      console.log("RENDERING")
      console.log(pendtenantId)
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
    pendpay:pendtenantId,
    aprov:aprov,
    recpay:rectenantId
  })
    })
          //  data populating 
  

  }//if ending curly braces

    
  })
// catching promis
pro.catch((r)=>{
  console.log('no user is found in database incorrect pswd')
})

    })

    
    
  
  
})


///  LISITING SERVER  DONT EDIT   //
app.listen(3000, function(req,result){
    console.log(" Server up and running:: http://localhost:3000")
})