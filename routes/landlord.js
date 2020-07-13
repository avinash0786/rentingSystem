require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
const landlord=require("../models/landlord")
const tenant=require("../models/tenant")
const transaction=require("../models/transaction")
const val = require("express-validator")
var bcrypt =require('bcrypt');
const saltRound=2312;

const router=express.Router();
router.use(bodyparser.json({ limit: "50mb" }));
router.use(bodyparser.urlencoded({extended:true}));
router.use(express.static('images'));
router.use(express.static('css'));
//MIDDLEWARES
function checkLogged(req,res,next){
    try{
        if(req.session.userID)
        {
            console.log("Session uid: "+req.session.userID+" redirected")
            req.redirect('/landlord-landing')
        }
        else {
            console.log("Session not defined, logging in");
            //next();
        }
    }
    catch (e) {
        res.redirect('/');
    }
    next();
}

router.post('/landlord-login',checkLogged,function(req, res) {
    console.log("Running Landlord login")
    let userid=req.body.name;
    console.log("User id:  "+userid)
    landlord.find({landlordID:userid}).exec()
        .then(user=>{
            if(user.length<1) {
                console.log("Landlord not Found!");
                res.send("Landlord not  Found")
            }
            else {
                bcrypt.compare(req.body.password,user[0].pswd,function (err,result) {
                if(err)
                {
                    res.send("Auth Failed")
                }
                if(result){
                    req.session.userID=userid;
                    console.log("Session uid: "+req.session.userID)
                    res.status(200).send("Auth Passed success");
                }
                else {
                    res.status(202).send("Login failed");
                }
                })
            }
        })
        .catch(err=>{
            res.send("Landlord found error !")
        })
});

router.post('/landlord-signup',function(req, res) {
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

router.get('/landlord-landing',function(req, res, next) {
    console.log("Running landlord- landing")
    res.send("/landlord-landing Recieved request ")
});

router.get('/landlord-profile',function(req, res, next) {
    res.send("/landlord-profile Recieved request ")
});

router.get('/landlord-trans',function(req, res, next) {
    res.send("/landlord-trans Recieved request ")
});

router.get('/landlord-genBill',function(req, res, next) {
    res.send("/landlord-genBill Recieved request ")
});

router.get('/landlord-tenant',function(req, res, next) {
    res.send("/landlord-tenant Recieved request ")
});

router.get('/landlord-property',function(req, res, next) {
    res.send("/landlord-property Recieved request ")
});

router.get('/landlord-createTenant',function(req, res, next) {
    res.send("landlord-createTenant Recieved request ")
});

router.get('/landlord-rentMetric',function(req, res, next) {
    res.send("landlord-rentMetric Recieved request ")
});

router.get('/landlord-maint',function(req, res, next) {
    res.send("Profile Recieved request ")
});

router.get('/landlord-recExp',function(req, res, next) {
    res.send("Profile Recieved request ")
});

router.get('/landlord-logout',function(req, res, next) {
    req.session.destroy(function (err) {
        if(err){
            res.redirect('/');
        }
    })
    res.redirect('/');
});





//Ending Don't Change
module.exports = router;