require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const hbs = require('hbs');
const session=require("express-session");

const landlord=require("../models/landlord")
const tenant=require("../models/tenant")
const transaction=require("../models/transaction")
const val = require("express-validator")
const url=process.env.DB_URL;

const router=express.Router();

router.get('/landlord/profile',function(req, res, next) {
    res.send("Recieved request ")
});











//Ending Don't Change
module.exports = router;