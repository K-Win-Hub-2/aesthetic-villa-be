'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let HistorySchema = new Schema({
    skinCareAndCosmetic: [{
        item: String,
        remark: String
    }],
    drugHistory: {
        type: String
    },
    medicalHistory: {
        type: String
    },
    allergyHistory: {
        type: String
    },
    treatmentHistory: {
        type: String
    },
    complaint: {
        type: String,
    },
    relatedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
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
    lmp:{
        type:Date
    },
    desiredTreatment:{
        type:String
    },
    note:{
        type:String
    },
    complaint:{
        type:String
    },
    consent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Attachments"
    }
});

module.exports = mongoose.model('Histories', HistorySchema);

//Author: Kyaw Zaw Lwin
