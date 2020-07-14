require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
const landlord=require("../models/landlord")
const tenant=require("../models/tenant")
const transaction=require("../models/transaction")
const val = require("express-validator")
const bcrypt =require('bcrypt');
const saltRound=2312;

const router=express.Router();
router.use(bodyparser.json({ limit: "50mb" }));
router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static('images'));
router.use(express.static('css'));
//MIDDLEWARES

const redirectLanding=(req,res,next)=>{
    if(req.session.userID){
        console.log("Redirected to dashboard");
        res.redirect("/landlord-landing")
    }
    else {
        console.log("Session uid  not exist")
        next()
    }
}

const redirectLogin=(req,res,next)=>{
    if(!req.session.userID){
        console.log("Session not defined, loggin first");
        res.redirect("/landlord-login")
    }
    else {
        console.log("Session uid: "+req.session.userID+" redirected")
        next()
    }
}

router.get('/landlord-login',redirectLanding,function (req,res) {
    res.render("main")
})

router.post('/landlord-login',redirectLanding,async (req, res)=>{
    console.log("Running Landlord login")
    let userid=req.body.name;
    console.log("User id:  "+userid)

    const user=await landlord.findOne({landlordID:userid})
    console.log(user)
    if(user==null)
    {
        console.log("Landlord not Found!");
        res.render("main",{message: "INCORRECT credentials"})
    }
    else {
        if(await bcrypt.compare(req.body.password,user.pswd)){
            console.log("Session Init")
            req.session.userID=userid;
            return res.redirect('/landlord-landing')// forwording to landing
        }
        else {
            res.render("main", {message: "INCORRECT credentials"})
        }
    }
});

router.post('/landlord-signup',redirectLanding,function(req, res) {
    var pswd=req.body.pswd;
    const qq=new Promise((resole,reject)=>{  //geeting new id
        landlord.countDocuments( {},function(err,r){
            let newID = r + 1;
            resole(newID)
        })
            .then((A)=>{
                console.log("Running then block")
            })
    });
    qq.then( (id)=>{
        bcrypt.hash(pswd,saltRound, function (err,hash) {
            if(err){
                return res.send("Password Error")
            }
            else {
                console.log("Registering user")
                var newLandlord=new landlord({
                    landlordID:id,
                    fname:req.body.fname,
                    lname:req.body.lname,
                    mobile:req.body.mobile,
                    baserent:req.body.baseRent,
                    water:req.body.water,
                    electricity:req.body.electricity,
                    security:req.body.security,
                    maintenance:req.body.maint,
                    address:req.body.address,
                    startRoom:req.body.startRoom,
                    endRoom:req.body.endRoom,
                    pswd:hash
                })
                newLandlord.save()
                    .then(doc=>{
                        res.status(201).send("Data insterted successfully");
                    })
                    .catch(err=>{
                        res.send("Error inserting ladlord")
                    })
            }
        });
    })
});

router.get('/landlord-landing',redirectLogin,async(req, res)=> {
    console.log("Running landlord- landing")
    var user=await landlord.findOne({landlordID:req.session.userID})
    //****************AGGREGATING DATA FOR LANDING PAGE*************************
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var d = new Date();
    var date=  days[d.getDay()]+" "+ d.getDate()+"-"+months[d.getMonth()]+"-"+d.getFullYear()

    var name,water,baserent,security,electricity,maintenance,approvCount,aprov,pendPay,pendPayCount,recPay,recPayCount,totaltenant;
    var pendtenantId
    var rectenantId
    var pednamearr=[]
    var pendnames;
    var recnamearr=[]
    var recnames;
    name=user.fname;
    baserent=user.baserent
    water= user.water
    electricity=user.electricity
    security=user.security
    maintenance=user.maintenance

    var result=await tenant.find({landlordID:req.session.userID, verified:false},'fname')
    aprov=result;
    approvCount=result.length;

    var d1=await tenant.countDocuments({landlordID:req.session.userID,verified: true})
    totaltenant=d1;

    var d2=await transaction.find({landlordID:req.session.userID, paidON: null},'tenantID tid dateGenerated amount');
    pendPayCount=d2.length;
    var i;

    for(i=0;i<d2.length;i++)
    {
        pednamearr.push(d2[i].tenantID);
        var temp=d2[i].dateGenerated.toString()
        d2[i].dateGenerated=temp.slice(0,21)
    }
    pendtenantId=d2;

    var d3=await transaction.find({landlordID:req.session.userID, paidON: {$ne:null}},'tenantID tid paidON amount')
    recPayCount=d3.length;
    var i;
    for(i=0;i<d3.length;i++)
    {
        recnamearr.push(d3[i].tenantID);
        var temp=d3[i].paidON.toString()
        d3[i].paidON=temp.slice(0,21)
    }
    rectenantId=d3

    const d5 =await tenant.find({tenantID:{$in:recnamearr}},'fname')
    recnames=d5;
    var i=0;
    for (i in rectenantId){
        rectenantId[i]['fname']=recnames[i].fname.toString();
        i++;
    }
    const d4=await tenant.find({tenantID:{$in:pednamearr}},'fname')
    pendnames=d4;
    var i=0;
    for (i in pendtenantId){
        pendtenantId[i]['fname']=pendnames[i].fname.toString();
        i++;
    }


    console.log("RENDERING")
    res.render("land",
        {
            username:name,
            userid:req.session.userID ,
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
});

router.get('/landlord-profile',redirectLogin,function(req, res, next) {
    res.send("/landlord-profile Recieved request ")
});

router.get('/landlord-trans',redirectLogin,function(req, res, next) {
    if(req.query.fetch=="paid")
    {
        res.send("/landlord-trans  Paid Recieved request ")
    }
    else if(req.query.fetch=="unpaid")
    {
        res.send("/landlord-trans  unpaid  Recieved request ")
    }
    else
    {
        res.send("/landlord-trans  All Recieved request ")
    }
});

router.get('/landlord-genBill',redirectLogin,function(req, res, next) {
    res.send("/landlord-genBill Recieved request ")
});

router.get('/landlord-tenant',redirectLogin,function(req, res, next) {
    res.send("/landlord-tenant Recieved request ")
});

router.get('/landlord-property',redirectLogin,function(req, res, next) {
    res.send("/landlord-property Recieved request ")
});

router.get('/landlord-createTenant',redirectLogin,function(req, res, next) {
    res.send("landlord-createTenant Recieved request ")
});

router.get('/landlord-rentMetric',redirectLogin,function(req, res, next) {
    res.send("landlord-rentMetric Recieved request ")
});

router.get('/landlord-maint',redirectLogin,function(req, res, next) {
    res.send("Profile Recieved request ")
});

router.get('/landlord-recExp',redirectLogin,function(req, res, next) {
    res.send("Profile Recieved request ")
});

router.get('/landlord-logout',redirectLogin,function(req, res, next) {
    req.session.destroy(function (err) {
        if(err){
            res.redirect('/');
        }
    })
    res.redirect('/');
});





//Ending Don't Change
module.exports = router;