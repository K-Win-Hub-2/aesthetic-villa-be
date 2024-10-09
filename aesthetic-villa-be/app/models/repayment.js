'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let RepaymentSchema = new Schema({
  repaymentDate: {
    type: Date,
  },
  repaymentAmount: {
    type: Number,
  },
  remaningCredit: {
    type: Number,
  },
  description: {
    type: String,
  },
  relatedPateintTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PatientTreatments',
    required: true,
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

module.exports = mongoose.model('Repayments', RepaymentSchema);

//Author: Kyaw Zaw Lwin
