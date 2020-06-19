const mongoose =require("mongoose")
const assert=require('assert');
const db_url=process.env.DB_URL;

mongoose.connect(
    db_url,
    {
        useUnifiedTopology:true,
        useNewUrlParser:true,
        useCreateIndex:true
    },
    function(err,link){
        assert.equal(err,null,"Database error...");

        console.log("db connect success...")
        console.log(db_url)
        //console.log(link)
    }
)