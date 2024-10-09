'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let PhysicalExaminationSchema = new Schema({
    skinType: [{
        item: String,
        remark: String
    }],
    acne: [{
        item: String,
        remark: String
    }],
    melasmaAndBlackSpot: [{
        item: String,
        remark: String
    }],
    mesoFat: [{
        item: String,
        remark: String
    }],
    facialDesign: [{
        item: String,
        remark: String
    }],
    otherPhysicalExamination: {
        type: String
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
});

module.exports = mongoose.model('PhysicalExaminations', PhysicalExaminationSchema);

//Author: Kyaw Zaw Lwin
