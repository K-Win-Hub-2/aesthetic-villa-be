'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let DebtSchema = new Schema({
    relatedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
    },
    relatedTreatmentVoucher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentVouchers'
    },
    relatedMedicineSale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentVouchers'
    },
    date: {
        type: Date
    },
    repay: [{
        repayId: {
            type: mongoose.Schema.ObjectId,
            ref:"Repaies"
        }
    }],
    balance: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isPaid: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Debts', DebtSchema);

//Author: Kyaw Zaw Lwin
