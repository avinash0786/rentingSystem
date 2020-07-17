require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
const landlord=require("../models/landlord")
const tenant=require("../models/tenant")
const transaction=require("../models/transaction")
const notifications=require("../models/notifications")
const val = require("express-validator")
var bcrypt =require('bcrypt');

const router=express.Router();
router.use(bodyparser.urlencoded({extended:true}));
router.use(bodyparser.json({ limit: "50mb" }));
router.use(express.static('images'));
router.use(express.static('css'));

const tenantlogged=(req,res,next)=>{
    if(!req.session.tenantID){
        console.log("Tenant Session not defined, logging in");
        res.redirect('/tenant-login')
    }
    else {
        console.log("Tenant Session uid: "+req.session.tenantID+" redirected")
        next()
    }
}

router.get('/tenant-login',tenantlogged,function(req, res, next) {
    res.send("/tenant-login Recieved request ")
});

router.post('/tenant-login',function(req, res) {
    console.log("Running tenant login")
    let tenantid=req.body.name;
    console.log("User id:  "+tenantid)
    tenant.find({tenantID:tenantid}).exec()
        .then(user=>{
            if(user.length<1) {
                console.log("tenant not Found!");
                res.send("Tenent not  Found")
            }
            else {
                bcrypt.compare(req.body.password,user[0].pswd,function (err,result) {
                    if(err)
                    {
                        res.send("Auth Failed")
                    }
                    if(result){
                        req.session.tenantID=tenantid;
                        console.log("Tenant Session uid: "+req.session.tenantID)
                        res.status(200).send("Auth Passed success");
                    }
                    else {
                        res.status(202).send("Login failed");
                    }
                })
            }
        })
        .catch(err=>{
            res.send("Tenant found error !")
        })
});

router.get('/tenant-signup',function(req, res, next) {
    res.send("/tenant-signup Recieved request ")
});

router.get('/tenant-landing',function(req, res, next) {
    res.send("/tenant-landing Recieved request ")
});

router.get('/tenant-profile',function(req, res, next) {
    res.send("/tenant-profile Recieved request ")
});

router.get('/tenant-trans',function(req, res, next) {
    res.send("/tenant-trans Recieved request ")
});

router.get('/tenant-payBill',function(req, res, next) {
    res.send("/tenant-payBill Recieved request ")
});

router.get('/tenant-maint',function(req, res, next) {
    res.send("/tenant-maint Recieved request ")
});

router.get('/tenant-logout',function(req, res, next) {
    req.session.destroy(function (err) {
        if(err){
            res.redirect('/');
        }
    })
    res.redirect('/');
});









//Ending Don't Change
module.exports = router;