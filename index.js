const express=require("express");
const bodyparser= require('body-parser');
const handlebars = require('express-handlebars');
const session=require("express-session");
const app=express();

app.use(session({secret:"1234asdf",resave:false, saveUninitialized:true}))
app.set('views',__dirname+'/views');
app.engine("hbs", handlebars({extname:'hbs', layoutsDir:__dirname+"/views"}))
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
    //res.sendFile(__dirname+"/index.html")
    res.render("main")
})//  e:\rentingSystem\backend

// verfying user 
app.post("/login", function(req,res){
  let username=parseInt(req.body.name);   // username
  let pswd=req.body.password;
  let name;   // password
  console.log("Username: "+username," password: "+pswd)
  MongoClient.connect(url, {useUnifiedTopology:true},function(err,db){
    if(err) throw err;
    var dbo=db.db("renting");
    dbo.collection("landlord").find( {landlordID:username,pswd: pswd},).toArray(function(err,result){
      if(err) throw err;
      if(result.length==0)
      {
        console.log("User not found res: ")
        res.render("main",{message: "INCORRECT credentials"})
      }
      else{
        req.session.userid=parseInt(req.body.name);   // username
        req.session.pswd=req.body.password;
        console.log("user found successful ");
        name=result[0].fname;
        console.log("name: "+name)
        res.render("land",{username:result[0].fname, userid: username })
      }
    })
  })
})


///  LISITING SERVER  DONT EDIT   //
app.listen(3000, function(req,res){
    console.log(" Server up and running:: http://localhost:3000")
})