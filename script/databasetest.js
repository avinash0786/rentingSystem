var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://admin:ADMIN@cluster0786-eve5j.mongodb.net/FIRST?retryWrites=true&w=majority";
MongoClient.connect(url,{ useUnifiedTopology: true } ,function(err, db) {
  if (err) throw err;
  var dbo = db.db("renting");
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
  let maintainance; // basic details
    dbo.collection("landlord").find( {landlordID:userid}).toArray(function(err,res){
      if(err) throw err;
      if(res.length==0)
      {
        console.log("User not found")
      }
      else{
        console.log("user found");
        console.log(res)
        //console.log(res[0].address)
        name=res[0].fname;
        baserent=res[0].baseRent;
        water=res[0].water;
        electricity=res[0].electricity;
        security=res[0].security;
        maintainance=res[0].maintenance;
      }
    })// pending approval count
    dbo.collection("tenant").find({verified:false}).count(function(err,res){
      if (err) throw err;
      console.log("Pending approval Tenants count  "+res);
      approvCount=res;
    })  //user approvals name
    dbo.collection("tenant").find({verified:false}, {projection: {fname:1, _id:0}}).toArray(function(err,res){
      if (err) throw err;
      console.log("Pending approval Tenants list: ");
      console.log(res);
      aprov=res;
      //console.log(aprov)
    }) // pending payments
    dbo.collection("transaction").find( {landlordID:userid , paidON: null}, {projection: {tid:1, tenantID:1, _id:0}}).toArray( function(err,res){
      if(err) throw err;
      console.log("pending payments : ")
      console.log(res)
      pendPay=res;
      console.log("pending payments COUNT : ")
      console.log(res.length)
      pendPayCount=res.length;
    })
    // recieved payments
    dbo.collection("transaction").find( {paidON: {$ne:null}}, {projection: {tid:1, tenantID:1, _id:0}}).toArray( function(err,res){
      if(err) throw err;
      console.log("Recieved payments: ")
      console.log(res)
      recPay=res;
      console.log("RECIEVED payments COUNT : ")
      console.log(res.length)
      recPayCount=res.length;
    })
    dbo.collection("tenant").find ({ verified: true}).count(function(err,res){
      console.log("Total verified Tenants: ")
      console.log(res);
      totaltenant=res;
    })///  aggregate([{$group : {_id : null, salary_sum : {$sum : "$salary"}}}])
/*
db.employee.aggregate([
  { $match: { salary : { $gt: 2000} } },
  {$group : {_id : "$firstName", salary_sum : {$sum : "$salary"}}}])
*/
    dbo.collection('transaction').aggregate([{$match: {paidON: {$ne: null}}}  , { $group: { _id:null, TotalSum: {$sum:"$amount"}}}]).toArray(function(err,res){
      console.log("Total amount: "+ res[0].TotalSum);
      totalprofit=res[0].TotalSum;
    })

     
  /*dbo.collection("tenant").find({ verified: true},{projection:{fname:1,lname:1,_id:0}}).toArray(function(err, result) {
    if (err) throw err;
    if(result.length==0)
        console.log("the result is undefined")
    console.log(result[0]);
    console.log(result[0].fname)  //getting name
    //db.close();
  });
  dbo.collection("transaction").find( {paidON: null}, {projection: {tid:1,landlordID:1, tenantID:1, _id:0}}).toArray( function(err,res){
    if(err) throw err;
    console.log(res[0])
    db.close();
  });*/

});