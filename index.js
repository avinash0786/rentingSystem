const express=require("express");
const bodyparser= require('body-parser');
///     DATABASE CONNECTION     ///
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://admin:ADMIN@cluster0786-eve5j.mongodb.net/FIRST?retryWrites=true&w=majority";

const app=express();
const homeroute=require('./routes/homepage');  // routing homepage

app.use("/logged",homeroute);  //logged in routes
app.use(express.static('images'));
app.use(express.static('css'));  //css files
app.use(bodyparser.urlencoded({extended:true}));
app.get("/", function(req,res){
    res.sendFile(__dirname+"/index.html")
})//  e:\rentingSystem\backend

// verfying user 
app.post("/login", function(req,res){
  let check=false;
  let username=parseInt(req.body.name);   // username
  let pswd=req.body.password;   // password
  console.log("Username: "+username," password: "+pswd)
  MongoClient.connect(url, {useUnifiedTopology:true},function(err,db){
    if(err) throw err;
    var dbo=db.db("renting");
    dbo.collection("landlord").find( {landlordID:username,pswd: pswd}).toArray(function(err,res){
      if(err) throw err;
      if(res.length==0)
      {
        console.log("User not found res: ")
      }
      else{
        console.log("user found successful ");
        check=true;
      }
    })
  })
  res.sendFile(__dirname+"/landertest.html")
})


///  LISITING SERVER  DONT EDIT   //
app.listen(3000, function(req,res){
    console.log(" Server up and running:: http://localhost:3000")
})