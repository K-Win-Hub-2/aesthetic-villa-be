'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let ComissionSchema = new Schema({
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    },
    relatedTreatmentSelection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TreatmentSelections"
    },
    appointmentAmount: {
        type: Number
    },
    commissionAmount: {
        type: Number
    },
    relatedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctors',
    },
    relatedTherapist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Therapists',
    },
    percent: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now()
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: String,
        enum: ['Claimed', 'Unclaimed'],
        default: 'Unclaimed'
    },
    relatedTreatmentVoucher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'TreatmentVouchers'
    },
    relatedNurse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Nurses'
    },
    voucherAmount:{
        type:Number
    }
});

module.exports = mongoose.model('Comissions', ComissionSchema);

//Author: Kyaw Zaw Lwin
