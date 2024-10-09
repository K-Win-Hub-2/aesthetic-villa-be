'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let AdvanceRecordSchema = new Schema({
    relatedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
    },
    recievedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
    },
    amount: {
        type: Number,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    remark: {
        type: String,
    },
    createdAt: {
        type: Date
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

module.exports = mongoose.model('AdvanceRecords', AdvanceRecordSchema);

//Author: Kyaw Zaw Lwin
