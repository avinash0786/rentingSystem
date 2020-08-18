require("dotenv").config();
const express=require("express");
const bodyparser= require('body-parser');
const session=require("express-session");
require("./database");
const landlord=require("./models/landlord")
const tenant=require("./models/tenant")
const transaction=require("./models/transaction")
const userRoute=require('./routes/landlord');
const landlordRoute=require('./routes/user');
const path=require("path")
var MemoryStore = require('memorystore')(session)
const expHbs=require("express-handlebars")
const helper=require("handlebars-helpers")();
const EmailService = require('./emailService')



const app=express();

app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret:"1234asdf",
  resave:false,
  saveUninitialized:false,
  maxAge:3600000}
  ))

var hbs=expHbs.create({
  extname:"hbs",
  defaultLayout:"main",
  layoutsDir:path.join(__dirname,"views/layout"),
  helpers: helper,
  partialsDir:path.join(__dirname,"views/partials"),
})
app.engine("hbs",hbs.engine)
app.set('view engine', 'hbs');

app.use(userRoute);
app.use(landlordRoute);
app.use(express.static(path.join(__dirname,"./images")));
app.use(express.static(path.join(__dirname,"./css")));
app.use(express.static(path.join(__dirname,"./script")));
app.use(express.static(path.join(__dirname,"./fonts")));
app.use(express.static(path.join(__dirname,"./icons")));
app.use(express.static(path.join(__dirname,"./js")));

app.use(bodyparser.urlencoded({extended:true}));

app.get("/", async (req,res)=>{
    res.render("first",{
      layout: false
    })
})
app.get("/test", async (req,res)=>{
  var emailname=req.query.email;
  var text=req.query.text;
  console.log(emailname)
  console.log(text)
    var all="<html>\n" +
        "<head>\n" +
        "\t<title></title>\n" +
        "\t<link href=\"https://svc.webspellchecker.net/spellcheck31/lf/scayt3/ckscayt/css/wsc.css\" rel=\"stylesheet\" type=\"text/css\" />\n" +
        "</head>\n" +
        "<body aria-readonly=\"false\">Hi, this is a web application under development and would like your suggestions and feedback,<br />\n" +
        "this web application facilitate&nbsp;the hectic work done by landlords in managing there tenant, your helpful suggested feature would definitely&nbsp;&nbsp;be implemented, kindly spend some moment in viewing this.<br />\n" +
        "A project by your friend.<br />\n" +
        "<br />\n" +
        "Also anyone willing to work in this project is welcomed having knowledge of web application development, would learn together.😊✌<br />\n" +
        "<br />\n" +
        "<a href=\"https://www.renting.systems/\">https://www.renting.systems</a><br />\n" +
        "<br />\n" +
        "Regards<br />\n" +
        "Admin Renting Systems<br />\n" +
        "<a href=\"https://www.renting.systems/logof.png\" target=\"_blank\"><img alt=\"Logo\" src=\"https://www.renting.systems/logof.png\" style=\"float:left; height:84px; width:200px\" /></a></body>\n" +
        "</html>\n"

  EmailService.sendText(emailname ,'Response',
      text
  )
      .then(() => {
        console.log("Email success")
      })
      .catch(() => {
        console.log("Email fail!")
      })
  res.render("test",{
    title:"Wroking",

  })
})

app.get('/tenantGet',function (req,res) {
  console.log('Autocomplete get')
  var regx=new RegExp(req.query["term"],"i");
  var tena=tenant.find({fname:regx},{fname:1,lname:1,_id:0}).sort({"updated_at": -1}).sort({"created_at":-1}).limit(5);
  tena.exec(function (err,data) {
  var result=[];
  if(!err){
    if(data && data.length && data.length>0){
      data.forEach(user=>{
        let obj={
          label:user.fname+" "+user.lname,
        };
        result.push(obj);
      });
    }
    res.jsonp(result);
  }
  })
})
///  LISITING SERVER  DONT EDIT   //
app.listen(process.env.PORT, function(req,result){
    console.log(" Server up and running:: http://localhost:3000")
})