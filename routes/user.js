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
const saltRound=2312;

const router=express.Router();
router.use(bodyparser.urlencoded({extended:true}));
router.use(bodyparser.json({ limit: "50mb" }));
router.use(express.static('images'));
router.use(express.static('css'));

const redirectLanding=(req,res,next)=>{
    if(req.session.tenantID){
        console.log("Tenant Redirected to dashboard");
        res.redirect("/tenant-landing")
    }
    else {
        console.log("Tenant Session uid  not exist")
        next()
    }
}

const redirectLogin=(req,res,next)=>{
    if(!req.session.tenantID){
        console.log("Tenant Session not defined, loggin first");
        res.redirect("/tenant-login")
    }
    else {
        console.log("Tenant Session uid: "+req.session.tenantID+" redirected")
        next()
    }
}

router.get('/tenant-login',redirectLanding,function(req, res, next) {
    res.render("tenant",{
        layout: false
    })
});

router.post('/tenant-login',redirectLanding,function(req, res) {
    console.log("Running tenant login")
    let tenantid=req.body.tenantID;
    console.log("User id:  "+tenantid)
    tenant.find({tenantID:tenantid}).exec()
        .then(user=>{
            if(user.length<1) {
                console.log("tenant not Found!");
                returnres.render("tenant",{
                    message:"Invalid Credential"
                })
            }
            else {
                bcrypt.compare(req.body.tenantpswd,user[0].pswd,function (err,result) {
                    if(err)
                    {
                        return res.render("tenant",{
                            message:"Invalid Credential"
                        })
                    }
                    if(result){
                        req.session.tenantID=tenantid;
                        console.log("Tenant Session uid: "+req.session.tenantID)
                        res.redirect("/tenant-landing")
                    }
                    else {
                        res.render("tenant",{
                            message:"Invalid Credential"
                        })
                    }
                })
            }
        })
        .catch(err=>{
            res.send("Tenant found error !")
        })
});

router.get('/tenant-landing',redirectLogin,async (req,res)=>{
    res.render("tenantDash",{
        layout:"tenantMain",
        fname:"Apple",
        lname:"Mango",
        id:"121"
    })
})

router.post('/tenant-signup',async (req, res)=> {
    console.log(req.body)
    var landlordID
    await landlord.findOne({landlordID:req.body.id})
        .then((d)=>{
            if(d)
            {
                console.log("Landlord exist")
                landlordID=d.landlordID;
            }
            else {
                return res.render("tenant",{
                    message1:"Landlord Does Not Exist Please Check Again !"
                })
            }
        });
    var newID;
    await tenant.aggregate([{ $group : { _id: null, maxid: { $max : "$tenantID" }}}])
        .then((d)=>{
            console.log(d[0])
            newID=d[0].maxid+1;
            console.log("New id: "+d)
        })
    var password=req.body.pswd;
    bcrypt.hash(password,saltRound,function (err,hash) {
        if(err)
        {
            console.log("Error Hashing")
            return res.redirect("/tenant-login")
        }
        else {
            var tt=new tenant({
                tenantID:newID,
                fname:req.body.fname,
                lname:req.body.lname,
                email:req.body.email,
                verified:false,
                landlordID:landlordID,
                pswd:hash,
            })
            console.log(tt)
            tt.save()
                .then((s)=>{
                    return res.render("tenant",{
                        message1:"Tenant Created Successfully use ID: "+newID+" to Login"
                    })
                })
        }
    })
});


router.get('/tenant-profile',function(req, res, next) {
    res.render("tenantProfile",{
        layout:"tenantMain",
    })
});

router.get('/tenant-trans',function(req, res, next) {
    res.render("tenantTransaction",{
        layout:"tenantMain",
    })
});

router.get('/tenant-payBill',function(req, res, next) {
    res.send("/tenant-payBill Recieved request ")
});

router.get('/tenant-notif',function(req, res, next) {
    res.render("tenantNotification",{
        layout:"tenantMain",
    })
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