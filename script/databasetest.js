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
  let maintainance; 
  var pendtenantId
  var pednamearr=[]
  var rectenantId
  var recnamearr=[]
  // basic details
  dbo.collection("transaction").find( {landlordID:1 , paidON: null}, {projection: {_id:0,tenantID:1,tid:1, dateGenerated:1}}).toArray( function(err,result){
    if(err) throw err;
    pendtenantId=result
    pendPayCount=result.length;
    var i;
    for(i=0;i<result.length;i++)
    {
      pednamearr.push(result[i].tenantID);
      var temp=result[i].dateGenerated.toString();
      console.log(temp.slice(0,10));
      result[i].dateGenerated=temp.slice(0,10);
    }
    console.log(pednamearr)
  })

  dbo.collection("transaction").find( {landlordID:1 , paidON: {$ne:null}}, {projection: {_id:0,tenantID:1,tid:1, paidON:1}}).toArray( function(err,result){
    if(err) throw err;
    rectenantId=result
    recPayCount=result.length;
    var i;
    for(i=0;i<result.length;i++)
    {
      recnamearr.push(result[i].tenantID);
      var temp=result[i].paidON.toString();
      console.log(temp.slice(0,10));
      result[i].paidON=temp.slice(0,10);
    }
    console.log(recnamearr)
  })
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
    
    // recieved payments
    
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

    

    dbo.collection("tenant").find({tenantID: {$in: pednamearr}}, {projection:{_id:0, fname:1}}).toArray(function(err,result){
      console.log("names:")
      console.log(result)
    })
    dbo.collection("tenant").find({tenantID: {$in: recnamearr}}, {projection:{_id:0, fname:1}}).toArray(function(err,result){
      console.log("names:")
      console.log(result)
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