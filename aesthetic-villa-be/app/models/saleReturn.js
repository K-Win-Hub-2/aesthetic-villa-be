'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SaleReturnSchema = new Schema({
    relatedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
    },
    relatedTreatmentSelection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections',
    },
    relatedTreatmentVoucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentVouchers',
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    },
    totalAmount: {
        type: Number,
    },
    leftoverAmount: {
        type: Number,
    },
    remark: {
        type: String
    },
    returnType: {
        type: String,
        enum: ['Full Cash', 'SubTreatment']
    },
    cashBack: {
        type: Number
    },
    relatedSubTreatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections'
    },
    isDeleted: {
        type: Boolean,
        default: false,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    relatedBank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedCash: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    }
});

module.exports = mongoose.model('SaleReturns', SaleReturnSchema);

//Author: Kyaw Zaw Lwin
