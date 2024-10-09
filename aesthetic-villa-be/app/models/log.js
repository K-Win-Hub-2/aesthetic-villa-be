'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let LogSchema = new Schema({
    relatedTreatmentSelection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections'
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    },
    date: {
        type: Date,
        default: Date.now()
    },
    currentQty: {
        type: Number,
    },
    actualQty: {
        type: Number,
    },
    finalQty: {
        type: Number,
    },
    relatedStock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stocks'
    },
    relatedProcedureItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcedureItems'
    },
    relatedAccessoryItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccessoryItems'
    },
    relatedMachine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FixedAssets'
    },
    relatedMedicineItems: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicineItems'
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    type: {
        type: String,
        enum: ['Stock Transfer', 'Usage', 'Request Recieved', 'Stock Update', 'Medicine Sale']
    }
});

module.exports = mongoose.model('Logs', LogSchema);

//Author: Kyaw Zaw Lwin
