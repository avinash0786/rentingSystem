const mongoose=require("mongoose");

const transaction=mongoose.Schema({
    tid:{
        type:Number,
        required:true,
        unique:true,
        min:0
    },
    dateGenerated:{
        type:String,
        default:Date.now,
        require:true
    },
    paidON:{
        type:String,
    },
    amount:{
        type:Number,
        required:true,
        min:0
    },
    landlordID:{
        type:Number,
        required:true,
        min:0
    },
    tenantID:{
        type:Number,
        require:true,
        min:0
    }
},
{ collection : 'transaction' }
)

mongoose.model('transaction',transaction);
module.exports=mongoose.model("transaction");