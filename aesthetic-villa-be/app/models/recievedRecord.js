'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let RecievedRecordSchema = new Schema({
    createdAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    requestedQty: {
        type: Number
    },
    recievedQty: {
        type: Number
    },
    relatedProcedureItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcedureItems'
    },
    relatedMedicineItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicineItems'
    },
    relatedAccessoryItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessoryItems'
    }
});

module.exports = mongoose.model('RecievedRecords', RecievedRecordSchema);

//Author: Kyaw Zaw Lwin
