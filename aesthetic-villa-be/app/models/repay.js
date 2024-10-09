const mongoose = require("mongoose");
mongoose.promise = global.Promise;

let RepaySchema = new mongoose.Schema({
    date:{
        type:Date
    },
    relatedTreatmentVoucher: {
         type : mongoose.Schema.Types.ObjectId,
         ref : "TreatmentVouchers"
    },
    relatedPatient : {
         type : mongoose.Schema.Types.ObjectId,
         ref : "Patients"
    },
    balance : {
        type : Number
    },
    remark : {
        type : String
    },
    relatedBank : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"AccountingLists"
    },
    relatedCash : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"AccountingLists"
    },
})

module.exports = mongoose.model("Repaies", RepaySchema)