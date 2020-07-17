const mongoose=require("mongoose")

const notifications=mongoose.Schema({
    requestID:{
        type:Number,
        required:true,
        unique:true
    },
    message:{
        type:String,
        trim:true,
        required:true
    },
    dateGenerated:{
        type:Date,
        default:Date.now()
    },
    fromLandlord:{
        type:Number
    },
    toLandlord:{
        type:Number
    },
    fromTenant:{
        type:Number
    },
    toTenant:{
        type:Number
    },
    readON:{
        type:Date
    }
},
{
    collection:'notifications'
});
mongoose.model('notifications',notifications);
module.exports=mongoose.model("notifications");
/*
requestID
message
dateGenerated
fromLandlord
toLandlord
fromTenant
toTenant
readON


 */