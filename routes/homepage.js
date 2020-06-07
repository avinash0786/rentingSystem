const express=require("express");
const bodyparser= require('body-parser');

const router=express.Router();

router.get("/logged", function(req,res){                  // LANDLORD INITIALLY
    //res.send("request seding")
    let username=req.body.name;
    let pswd=req.body.password;
    console.log("Username: "+username," password: "+pswd)
    res.sendFile(__dirname+"/landertest.html")
/*Name 
Unique ID
Month
Received payments, Count ** tenant ID, Name, Amount
Pending payments, Count ** tenant ID, Name, Amount
Total profit
User approval and count
total tenant count
Account balance
New user form last 3 months
Landlord’s rent metrics
  let totalprofit;
const userid=1;
  const pswd=1234;
  let name;
  let recPay;
  let recPayCount;
  let pendPay;
  let pendPayCount;
  let totalprofit;
  let aprov;
  let approvCount;
  let baserent;
  let electricity;
  let water;
  let totaltenant;
  let security;
  let maintainance;//  
*/
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var d = new Date();
let date=  days[d.getDay()]+" "+ d.getDate()+"-"+months[d.getMonth()]+"-"+d.getFullYear();
console.log(date)
let name;
let uid;
let month;


    //res.json({"apple": "this i sapple"});
})

/////////////////////////////////////////////
module.exports=router;