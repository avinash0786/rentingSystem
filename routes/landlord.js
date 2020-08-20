require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const landlord=require("../models/landlord")
const tenant=require("../models/tenant")
const transaction=require("../models/transaction")
const notifications=require("../models/notifications")
const { check, validationResult } = require('express-validator');
const val = require("express-validator")
const bcrypt =require('bcrypt');
const saltRound=2312;

const router=express.Router();
router.use(bodyparser.json({ limit: "50mb" }));
router.use(bodyparser.urlencoded({extended:true}));

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
    res.render("landlord_login", {layout: false})
})

router.post('/landlord-login',
    [
        check("name").not().isEmpty().trim().escape().isNumeric(),
        check("password").not().isEmpty().trim().escape(),
    ],
    redirectLanding,async (req, res)=>{
    const valError=validationResult(req);
    if(!valError.isEmpty())
    {   console.log("Validation Error!")
        return res.render("landlord_login",{layout: false,message: "Invalid Value"})
    }
    console.log("Running Landlord login")
    let userid=req.body.name;
    console.log("User id:  "+userid)

    const user=await landlord.findOne({landlordID:userid})
    console.log(user)
    if(user==null)
    {
        console.log("Landlord not Found!");
        res.render("landlord_login",{layout: false,message: "INCORRECT credentials"})
    }
    else {
        if(await bcrypt.compare(req.body.password,user.pswd)){
            var newreq;
            await notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
                .then((d)=>{
                    console.log(d[0])
                    newreq=d[0].maxid+1;
                })
            var loginmessage=new notifications({
                requestID:newreq,
                message:"New login at: "+Date().toString(),
                toLandlord:userid,
                from:"Admin"
            })
            loginmessage.save()
            console.log("Session Init")
            req.session.userID=userid;
            req.session.fname=user.fname;
            req.session.lname=user.lname;
            return res.redirect('/landlord-landing')// forwording to landing
        }
        else {
            res.render("landlord_login", {layout: false,message: "INCORRECT credentials"})
        }
    }
});

router.post('/landlord-signup',async (req, res)=> {
    var newID;
    // await landlord.countDocuments({})
    //     .then((d)=>{
    //         newID=d+1;
    //     });
    await landlord.aggregate([{ $group : { _id: null, maxid: { $max : "$landlordID" }}}])
        .then((d)=>{
            console.log(d[0])
            newID=d[0].maxid+1;
        })
    var password=req.body.pswd;
    bcrypt.hash(password,saltRound,function (err,hash) {
        if(err)
        {
            console.log("Error hashing")
            return res.redirect("/landlord-login")
        }
        else {
            console.log(newID)
            var ll=new landlord({
                landlordID:newID,
                fname:req.body.fname,
                lname:req.body.lname,
                email:req.body.email,
                pswd:hash
            })
            ll.save()
            notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
                .then((d)=>{
                    console.log(d[0])
                    var newreq=d[0].maxid+1;
                    var admmessage=new notifications({
                        requestID:newreq,
                        message:"Welcome, "+req.body.fname+" here you can find all the notifications and alerts",
                        toLandlord:req.session.userID,
                        from:"Admin"
                    })
                    admmessage.save()
                })
            res.render("landlord_login", {
                layout: false,
                message2: "New Landlord Created Successfully ID: "+newID
            })
        }
    })
});

router.get('/landlord-landing',redirectLogin,async(req, res)=> {
    console.log("Running landlord- landing")
    var user=await landlord.findOne({landlordID:req.session.userID}).lean()
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
    baserent=user.baseRent
    water= user.water
    electricity=user.electricity
    security=user.security
    maintenance=user.maintenance

    var result=await tenant.find({landlordID:req.session.userID, verified:false},'fname tenantID').lean()
    aprov=result;
    approvCount=result.length;

    var d1=await tenant.countDocuments({landlordID:req.session.userID,verified: true}).lean()
    totaltenant=d1;

    var d2=await transaction.find({landlordID:req.session.userID, paidON: null},'tenantID tid dateGenerated amount').lean();
    pendPayCount=d2.length;
    var d3=await transaction.find({landlordID:req.session.userID, paidON: {$ne:null}},'tenantID tid paidON amount').lean()
    recPayCount=d3.length;


    var mot=await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.userID),
            }
        },
        {
            $group:
                {
                    _id:null,
                    month: {
                        $max: "$month"
                    }
                }
        }
    ])
    var maxMonth=mot[0].month;
    var d5=await transaction.countDocuments({landlordID:req.session.userID, month:maxMonth}).lean()
    const recieved= await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.userID),
                paidON:{$ne:null},
                month:maxMonth
            }
        },
        {
            $lookup:
                {
                    from: "tenant",
                    localField: "tenantID",
                    foreignField: "tenantID",
                    as: "NameMatch"
                }
        },
        {
            $project:{
                NameMatch: {fname:1},
                tid:1,
                amount:1
            }
        },
        { $sort : { _id: -1 } }
    ])

    const pending= await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.userID),
                paidON:null,
                month:maxMonth
            }
        },
        {
            $lookup:
                {
                    from: "tenant",
                    localField: "tenantID",
                    foreignField: "tenantID",
                    as: "NameMatch"
                }
        },
        {
            $project:{
                NameMatch: {fname:1},
                tid:1,
                amount:1
            }
        },
        { $sort : { _id: -1 } }
    ])
    var recmonth=(recieved.length/d5)*100;
    var penmonth=(pending.length/d5)*100;

    var metricwise=await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.userID)
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

    var totalelec=await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.userID)
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

    var monthunits=await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.userID)
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

    var monthprofit=await transaction.aggregate([
        {
            $match:{
                landlordID:parseInt(req.session.userID)
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
    monthprofit.forEach(d=>{
        d['month']=months[d.month-1]
    })

    console.log("RENDERING")
    res.render("land",
        {
            ans:monthprofit,
            res:metricwise[0],
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
            tenantcount:totaltenant,
            approvalcount:approvCount,
            pendpay:pending,
            aprov:aprov,
            recpay:recieved,
            maxmo:months[maxMonth-1],
            title:"Dashboard",
            fname:req.session.fname,
            lname:req.session.lname,
            id:req.session.userID,
            rec:recmonth,
            pen:penmonth,
            totalunit:totalelec[0].total,
            monthunits:monthunits
        })
});

router.get('/landlord-profile',redirectLogin,async (req, res)=> {
    landlord.findOne({landlordID:req.session.userID}).lean()
        .then((data)=>{
            console.log(data)
            res.render("profileLand",{
                data:data,
                title:"Dashboard",
                fname:req.session.fname,
                lname:req.session.lname,
                id:req.session.userID
            })
        })
});

router.post("/landlord-updateInfo",redirectLogin,async (req,res)=>{
    console.log(req.body)
    landlord.updateOne({landlordID:req.session.userID},{
        fname:req.body.fname,
        lname:req.body.lname,
        mobile:req.body.mobile,
        email:req.body.email,
        baseRent:req.body.baserent,
        water:req.body.water,
        electricity:req.body.electricity,
        security:req.body.security,
        maintenance:req.body.maint,
        address:req.body.address
    })
        .then((dta)=>{
             notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
                .then((d)=>{
                    console.log(d[0])
                    var newreq=d[0].maxid+1;
                    var admmessage=new notifications({
                        requestID:newreq,
                        message:"Profile details upated ",
                        toLandlord:req.session.userID,
                        from:"Admin"
                    })
                    admmessage.save()
                })
            req.session.fname=req.body.fname;
            req.session.lname=req.body.lname
            res.redirect("/landlord-profile")
        })
        .catch((e)=>{
            res.send("Update request Failed")
            console.log("error in Update")
            console.log(e)
        })
})

router.get('/landlord-trans',redirectLogin,async(req, res)=> {
    const user=parseInt(req.session.userID);
    if(req.query.fetch==="paid")
    {
        const ans= await transaction.aggregate([
            {
                $match:{
                    landlordID:user,
                    paidON:{$ne:null}
                }
            },
            {
                $lookup:
                    {
                        from: "tenant",
                        localField: "tenantID",
                        foreignField: "tenantID",
                        as: "NameMatch"
                    }
            },
            {
                $project:{
                    dateGen:{$dateToString: {format: "%Y-%m-%d %H:%M:%S", date: "$dateGenerated"}},
                    datePaid:{$dateToString: {format: "%Y-%m-%d %H:%M:%S", date: "$paidON"}},
                    NameMatch: {fname:1},fname:1,
                    tid:1,amount:1,tenantID:1,baseRent:1,water:1,electricity:1,maintenance:1,security:1,month:1,year:1,initialUnit:1,finalUnit:1
                }
            },
            { $sort : { _id: -1 } }
        ])

        res.render("transactions",
            {
                type:'Only Paid',
                land:req.session.userID,
                trans:ans,
                title:"Transaction",
                fname:req.session.fname,
                lname:req.session.lname,
                id:req.session.userID
            });
    }
    else if(req.query.fetch==="unpaid")
    {
        const ans= await transaction.aggregate([
            {
                $match:{
                    landlordID:user,
                    paidON:null
                }
            },
            {
                $lookup:
                    {
                        from: "tenant",
                        localField: "tenantID",
                        foreignField: "tenantID",
                        as: "NameMatch"
                    }
            },
            {
                $project:{
                    dateGen:{$dateToString: {format: "%Y-%m-%d %H:%M:%S", date: "$dateGenerated"}},
                    datePaid:{$dateToString: {format: "%Y-%m-%d %H:%M:%S", date: "$paidON"}},
                    NameMatch: {fname:1},fname:1,
                    tid:1,amount:1,tenantID:1,baseRent:1,water:1,electricity:1,maintenance:1,security:1,month:1,year:1,initialUnit:1,finalUnit:1
                }
            },
            { $sort : { _id: -1 } }
        ])

        res.render("transactions",
            {
                type:'Only UnPaid',
                land:req.session.userID,
                trans:ans,
                title:"Transaction",
                fname:req.session.fname,
                lname:req.session.lname,
                id:req.session.userID
            });
    }
    else
    {
        const ans= await transaction.aggregate([
            {
                $match:{
                    landlordID:user,
                }
            },
            {
                $lookup:
                    {
                        from: "tenant",
                        localField: "tenantID",
                        foreignField: "tenantID",
                        as: "NameMatch"
                    }
            },
            {
                $project:{
                    dateGen:{$dateToString: {format: "%Y-%m-%d %H:%M:%S", date: "$dateGenerated"}},
                    datePaid:{$dateToString: {format: "%Y-%m-%d %H:%M:%S", date: "$paidON"}},
                    NameMatch: {fname:1},fname:1,
                    tid:1,amount:1,tenantID:1,baseRent:1,water:1,electricity:1,maintenance:1,security:1,paidON:1,month:1,year:1,initialUnit:1,finalUnit:1
                }
            },
            { $sort : { _id: -1 } }
        ])
        res.render("transactions",
            {
                type:'All',
                land:req.session.userID,
                trans:ans,
                title:"Transaction",
                fname:req.session.fname,
                lname:req.session.lname,
                id:req.session.userID
            });
    }
});

router.get('/landlord-genBill',redirectLogin,function(req, res, next) {

    res.render("billGenerate",{
        alreadyGenerated:null,
        tenantDetails:null,
        dropdown:true,
        title:"Bill Generate",
        fname:req.session.fname,
        lname:req.session.lname,
        id:req.session.userID
    })
});

router.get('/landlord-tenant',redirectLogin,async (req, res, next)=> {
    const ans =await tenant.find({landlordID:req.session.userID}).sort({_id:-1}).lean()
    res.render("tenants",{
        tenant:ans,
        title:"Tenants",
        fname:req.session.fname,
        lname:req.session.lname,
        id:req.session.userID
    })
});

router.get("/landlord-genBillPopulateTenant",redirectLogin,async (req,res)=> {
    const user=parseInt(req.session.userID);
    const month=parseInt(req.query.month);
    req.session.month=month;
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var d = new Date();
    var date=  days[d.getDay()]+" "+ d.getDate()+"-"+months[d.getMonth()]+"-"+d.getFullYear()
    console.log(month)
    console.log(date)
    var year=d.getFullYear();
    req.session.year=parseInt(year);
    console.log("Year: "+req.session.year)
    var monthName=months[month-1];
    req.session.monthname=monthName
    var trans=await transaction.findOne({landlordID:req.session.userID,year:year,month:month}).lean()
    console.log(trans)
    if(!(trans===null))
    {
        return res.render("billGenerate",{
            alreadyGenerated:true,
            tenantDetails:null,
            dropdown:false,
            month:monthName,
            title:"Bill Generate",
            fname:req.session.fname,
            lname:req.session.lname,
            id:req.session.userID
        })
    }
    console.log("Landlord: "+req.session.userID)
    var ans=await tenant.find({landlordID:req.session.userID,verified:true}).lean()
    var land=await landlord.find({landlordID:req.session.userID}).lean()
    console.log(land)
    console.log("Rendering tenane")
    res.render("billGenerate",{
        land:land[0],
        alreadyGenerated:false,
        tenantDetails:true,
        dropdown:false,
        tenants:ans,
        Tenantcount:ans.length,
        month:monthName,
        title:"Bill Generate",
        fname:req.session.fname,
        lname:req.session.lname,
        id:req.session.userID
    })
})

router.post("/landlord-finalBill",redirectLogin,async (req,res)=> {
    console.log(req.body)
    var ans=await landlord.findOne({landlordID:req.session.userID})
    console.log(ans)
    var extras=ans.baseRent+ans.water+ans.maintenance+ans.security;
    var elecMetric=ans.electricity;
    console.log("Extras sum: "+extras)
    var ten=await tenant.find({landlordID:req.session.userID,verified:true})
    var tidnew=await transaction.countDocuments({});
    console.log(tidnew)
    //console.log("Date: "+new Date(req.session.billGendate))
    ten.forEach((t)=>{
         tidnew+=1;
        // var ini="initial"+t.tenantID;
        // var fin="current"+t.tenantID;
        var eleAmount=elecMetric*Math.abs((req.body["current"+t.tenantID]-req.body["initial"+t.tenantID]));
        console.log("Elec : "+eleAmount)
        var transac=new transaction({
            tid:tidnew,
            month:req.session.month,
            paidON:null,
            year:req.session.year,
            amount:(eleAmount+extras),
            landlordID:req.session.userID,
            tenantID:t.tenantID,
            baseRent:ans.baseRent,
            water:ans.water,
            electricity:eleAmount,
            maintenance:ans.maintenance,
            security:ans.security,
            initialUnit:req.body["initial"+t.tenantID],
            finalUnit:req.body["current"+t.tenantID]
        })
        transac.save()
            .then((d)=>{
                console.log("Data saved successfully")
            })
            .catch((e)=>{
                console.log("Database save Error !")
                console.log("Error: "+e)
                res.render("error",{
                    layout: false
                });
            })
    })
    await notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
        .then((d)=>{
            console.log(d[0])
            newreq=d[0].maxid+1;
        })
    var admmessage=new notifications({
        requestID:newreq,
        message:ten.length+" new Trasnactions created for month: "+req.session.monthname,
        toLandlord:req.session.userID,
        from:"Admin"
    })
    admmessage.save()

    res.render("billGenerate",{
        alreadyGenerated:false,
        tenantDetails:false,
        dropdown:true,
        transCount:ten.length,
        monthname:req.session.monthname,
        title:"Bill Generate",
        fname:req.session.fname,
        lname:req.session.lname,
        id:req.session.userID
    })
})

router.get('/landlord-property',redirectLogin,function(req, res, next) {
    res.send("/landlord-property Recieved request ")
});

router.get('/landlord-createTenant',redirectLogin,function(req, res, next) {
    res.render("createTenant",{
        tenantID:null,title:"Create Tenant",
        fname:req.session.fname,
        lname:req.session.lname,
        id:req.session.userID
    })
});

router.post('/landlord-createTenant',redirectLogin,async (req, res)=> {
    var newTenantID=await tenant.countDocuments({})+2;
    console.log(newTenantID)
    var pswd=toString(req.body.password);
    console.log(req.body)
    bcrypt.hash(pswd,saltRound,async (err,hash) =>{
        if(err){
            console.log("Error Hashing Password! ")
        }
        else {
            var tenantnew=new tenant({
                tenantID:newTenantID,
                fname:req.body.fname,
                lname:req.body.lname,
                email:req.body.email,
                pswd:hash,
                room:newTenantID,
                verified:true,
                landlordID:req.session.userID,
            })
            tenantnew.save();

            await notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
                .then((d)=>{
                    console.log(d[0])
                    newreq=d[0].maxid+1;
                })
            var admmessage=new notifications({
                requestID:newreq,
                message:"New approved Tenant created by you Tenant ID: "+newTenantID,
                toLandlord:req.session.userID,
                from:"Admin"
            })
            admmessage.save()
            res.render("createTenant",{
                tenantID:newTenantID,
                title:"Create Tenant",
                fname:req.session.fname,
                lname:req.session.lname,
                id:req.session.userID
            })
        }
    })
});

router.get('/landlord-notification',redirectLogin,function(req, res, next) {
    if(req.query.type==="sent")
    {
        console.log("Sent messages retieve")
        notifications.find({fromLandlord:req.session.userID}).sort({_id:-1}).lean()
            .then((not)=>{
                return res.render("notifications",{
                    notif:not,
                    title:"Notification",
                    fname:req.session.fname,
                    lname:req.session.lname,
                    id:req.session.userID
                })
            })
            .catch((E)=>{
                console.log("error db notification"+E)
                res.redirect("/landlord-error");
            })
    }
    else {
        console.log("REcieved messages retieve")
        notifications.find({toLandlord:req.session.userID}).sort({_id:-1}).lean()
            .then((not)=>{
                return res.render("notifications",{
                    notif:not,
                    title:"Notifications",
                    fname:req.session.fname,
                    lname:req.session.lname,
                    id:req.session.userID
                })
            })
            .catch((E)=>{
                console.log("error db rec"+E)
                res.redirect("/landlord-error");
            })

    }
});

router.get('/landlord-send',redirectLogin,function (req, res, next) {
    tenant.find({landlordID:req.session.userID}).lean()
        .then((doc)=>{
            res.render("landlordsend1",{
                tenants:doc,
                error:false,
                message:false,
                title:"Send Notification",
                fname:req.session.fname,
                lname:req.session.lname,
                id:req.session.userID
            })
        })
        .catch((e)=>{
            res.redirect("/landlord-error");
        })
});

router.post('/landlord-send',redirectLogin,async (req, res, next)=> {
    var newID=await notifications.countDocuments({})+1;
    if(req.body.broad)
    {
        console.log("broadcasting")
        var mes=req.body.message;
        tenant.find({landlordID:req.session.userID,verified:true}).lean()
            .then((doc)=>{
                doc.forEach((tenant)=>{
                    var notif=new notifications({
                        requestID:newID++,
                        message:mes,
                        fromLandlord:req.session.userID,
                        toTenant:tenant.tenantID
                    })
                    notif.save()
                })
                tenant.find({landlordID:req.session.userID}).lean()
                    .then((dc)=>{
                        res.render("landlordsend1",{
                            tenants:dc,
                            error:false,
                            message:"broadcasted"
                        })
                    })
            })
    }
    else
    {
        console.log(req.body)
        var tid=req.body.id;
        tenant.find({landlordID:req.session.userID,tenantID:tid}).lean()
            .then((doc)=>{
                console.log(doc)
                if(doc.length>0)
                {
                    console.log("Tenant found")
                    var notif=new notifications({
                        requestID:newID++,
                        message:req.body.message,
                        fromLandlord:req.session.userID,
                        toTenant:tid
                    })
                    notif.save()  //saving notifications
                        .then(()=>{
                            tenant.find({landlordID:req.session.userID}).lean()
                                .then((dc)=>{
                                    res.render("landlordsend1",{
                                        tenants:dc,
                                        error:false,
                                        message:"sent"
                                    })
                                })
                        })
                }
                else {
                    console.log("Tenant not  found")
                    tenant.find({landlordID:req.session.userID}).lean()
                        .then((dc)=>{
                            res.render("landlordsend1",{
                                tenants:dc,
                                error:true,
                                message:""
                            })
                        })
                }
            })
            .catch(()=>{
                console.log("Fetch error!")
                res.redirect("/landlord-error");
            })
    }
});

router.get('/transinfo',async (req,res)=> {
    console.log("Tid recieved: "+req.query.tid)
    var ans=await transaction.findOne({tid:req.query.tid})
    //console.log("Ans: "+ans)
    return res.send({
        data:ans
    })
})

router.get('/updatereadon',function (req,res) {
    console.log("Updating read on for: "+req.query.rid);
    notifications.updateOne({requestID:req.query.rid},{readON:Date()})
        .then(d=>{
            return res.send({
                respose:d
            })
        })
        .catch(e=>{
            console.log("error read on: "+e)
        })
})

router.get('/landlordcheck',function (req,res) {
    console.log("checking landlord for: "+req.query.lid);
    landlord.findOne({landlordID:req.query.lid})
        .then(data=>{
            if(data)
            {
                return res.send({
                    exist:true
                })
            }
            else {
                return res.send({
                    exist:false
                })
            }
        })
        .catch(e=>{
            res.send("Error checking")
        })
})

router.get("/loadlast",function (req,res) {
    transaction.aggregate([
        {
            $match: {
                landlordID:parseInt(req.session.userID),
                year:parseInt(req.session.year)
            }
        },
        {
            $group:{
                _id: { tenantID : "$tenantID" },
                finalUnit: { $last : "$finalUnit" }
            }
        },
        { $sort : { _id: 1 } }
    ])
        .then(data=>{
            // console.log("Load data")
            // console.log(data);
            return res.send({
                load:data
            })
        })
})

router.post('/landlord-approve',async (req,res)=> {
    console.log("Running approval route")
    await notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
        .then((d)=>{
            console.log(d[0])
            newreq=d[0].maxid+1;
        })
    var admmessage=new notifications({
        requestID:newreq,
        message:"Tenant Id: "+req.body.val+" Approval request Accepted!",
        toLandlord:req.session.userID,
        from:"Admin"
    })
    admmessage.save()
    tenant.findOneAndUpdate({tenantID:req.body.val},{verified:true})
        .then(d=>{
            console.log("Approve success")
            return res.json({
                success:true
            })
        })
})

router.post('/landlord-discard',async (req,res)=> {
    console.log("Running discard route")
    await notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
        .then((d)=>{
            console.log(d[0])
            newreq=d[0].maxid+1;
        })
    var admmessage=new notifications({
        requestID:newreq,
        message:"Tenant Id: "+req.body.val+" Approval request discarded!",
        toLandlord:req.session.userID,
        from:"Admin"
    })
    admmessage.save()
    tenant.deleteOne({tenantID:req.body.val}).then(d=>{
        console.log("Discard success")
        return res.json({
            success:true
        })
    })
})

router.post('/landlord-createTenant',redirectLogin,function(req, res, next) {
    res.render("createTenant",{
        tenantID:null
    })
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

router.get('/landlord-error',redirectLogin,function(req, res) {
    console.log("Error Page Requested")
    res.render("error",{
        layout: false
    })
});

router.get('/landlord-logout',redirectLogin,async (req, res, next)=> {
    await notifications.aggregate([{ $group : { _id: null, maxid: { $max : "$requestID" }}}])
        .then((d)=>{
            console.log(d[0])
            newreq=d[0].maxid+1;
        })
    var admmessage=new notifications({
        requestID:newreq,
        message:"Logout at: "+Date().toString(),
        toLandlord:req.session.userID,
        from:"Admin"
    })
    admmessage.save()
    req.session.destroy(function (err) {
        if(err){
            res.redirect('/');
        }
    })
    console.log("Session destroyed: Logout")
    res.redirect('/');
});





//Ending Don't Change
module.exports = router;