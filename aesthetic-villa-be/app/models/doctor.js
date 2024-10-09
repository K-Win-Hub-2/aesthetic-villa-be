'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let DoctorSchema = new Schema({
  name: {
    type: String,
  },
  code: {
    type:String,
  },
  speciality: {
    type: String,

  },
  treatmentUnitMain: {
    type: String,

  },
  schedule: {
    type: Array,

  },
  commissionAmount: {
    type: Number,

  },
  commissionPercent: {
    type: Number,

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
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('Doctors', DoctorSchema);

//Author: Kyaw Zaw Lwin
