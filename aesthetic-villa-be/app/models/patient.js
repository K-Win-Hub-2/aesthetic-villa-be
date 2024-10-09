'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let PatientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
  },
  date: {
    type: String
  },
  email: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
  },
  address: {
    type: String,
  },
  occupation: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  patientStatus: {
    type: String,
    enum: ['New', 'Old'],

    default: 'New',

  },
  patientID: {
    type: String,
  },
  seq: {
    type: Number
  },
  img: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachments',
  },
  relatedTreatmentSelection: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'TreatmentSelections'
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
  relatedMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Members'
  },
  conditionAmount: {
    type: Number,
  },
  conditionPurchaseFreq: {
    type: Number,
  },
  conditionPackageQty: {
    type: Number
  },
  treatmentPackageQty: {
    type: Number
  },
  totalAmount: {
    type: Number
  },
  totalAppointments: {
    type: Number,
    default: 0
  },
  finishedAppointments: {
    type: Number,
    default: 0
  },
  unfinishedAppointments: {
    type: Number,
    default: 0
  },
  totalTS: {
    type: Number,
    default: 0
  },
  finishedTS: {
    type: Number,
    default: 0
  },
  unfinishedTS: {
    type: Number,
    default: 0
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'N/A']
  },
  relatedPackageSelection: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'PackageSelections'
  },
  totalPaidAmount: {
    type: Number,
    default: 0
  },
  debtBalance: {
    type: Number,
    default: 0
  }
});
const patient = mongoose.model('Patients', PatientSchema)
module.exports = patient;


//Author: Kyaw Zaw Lwin
