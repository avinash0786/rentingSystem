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
    req.session.landlordLog=false;
    console.log("LandlordLog ->false")
    console.log(req.session)
    res.render("tenant",{
        layout: false,
        fname:req.session.tgiven_name,
        lname:req.session.tfamily_name,
        email:req.session.temail,
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
    /*  DATA
    total pending mount
    total paid amount
    expense donught chart
    total month wise expenses
     */
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let tenUser=await tenant.findOne({tenantID:parseInt(req.session.tenantID),verified:true})
    console.log(tenUser);
    let fname=tenUser.fname;
    let lname=tenUser.lname;
    let room=tenUser.room;
    let land=await landlord.findOne({landlordID:parseInt(tenUser.landlordID)})

    var totalelec=await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.tenantID)
            }
        },
        {
            $group:{
                _id: null,
                total: {
                    $sum: {$subtract:["$finalUnit","$initialUnit"]}
                }
            }
        }
    ]);
    if(totalelec[0]!==undefined)
    {
        totalelec=totalelec[0].total
    }
    else {
        totalelec=0;
    }
    console.log(totalelec);

    var metricwise=await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.tenantID)
            }
        },
        {
            $group:{
                _id:null,
                baseRent: { $sum : "$baseRent" },
                water:{ $sum:"$water"},
                electricity:{ $sum:"$electricity"},
                security:{ $sum:"$security"},
                maintenance:{ $sum:"$maintenance"},
                amount:{$sum:"$amount"}
            }
        }
    ])
    console.log(metricwise)
    var monthunits=await transaction.aggregate([
        {
            $match:{
                tenantID:parseInt(req.session.tenantID)
            }
        },
        {
            $group:{
                _id: {month:"$month"},
                elec:{$sum:{$subtract:["$finalUnit","$initialUnit"]}}
            }
        },
        {
            $sort:{
                _id: 1
            }
        },
        {
            $project:{
                elec:1,
                month:"$_id.month",
                _id:0
            }
        }
    ]);
    monthunits.forEach(d=>{
        d['month']=months[d.month-1]
    })
    console.log(monthunits)

    var monthSpend=await transaction.aggregate([
        {
            $match:{
                tenantID:parseInt(req.session.tenantID)
            }
        },
        {
            $group:{
                _id: { month : "$month" },
                profit: { $sum : "$amount" },
                month:{$max:"$month"},
                eleUnit:{ $sum: { $subtract: ["$finalUnit","$initialUnit"] } }
            }
        },
        {
            $sort:{
                month:1
            }
        }
    ]);
    monthSpend.forEach(d=>{
        d['month']=months[d.month-1]
    })
    console.log(monthSpend)
    res.render("tenantDash",{
        monthSpend:monthSpend,
        monthUnit:monthunits,
        layout:"tenantMain",
        fname:fname,
        lname:lname,
        id:req.session.tenantID,
        roomno:room,
        baseRent:land.baseRent,
        water:land.water,
        elec:land.electricity,
        security:land.security,
        maint:land.maintenance,
        landFname:land.fname,
        landLname:land.lname,
        landMobile:land.mobile,
        landEmail:land.email,
        landAddress:land.address,
        metricwise:metricwise[0]
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