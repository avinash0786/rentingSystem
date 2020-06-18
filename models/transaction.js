const mongoose=require("mongoose");

const transaction=mongoose.Schema({
    tid:{
        type:Number,
        required:true,
        unique:true,
        min:0
    },
    dateGenerated:{
        type:Date,
        default:Date.now,
        require:true
    },
    paidON:{
        type:Date,
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
})

mongoose.model('transaction',transaction);
module.exports=mongoose.model("transaction");