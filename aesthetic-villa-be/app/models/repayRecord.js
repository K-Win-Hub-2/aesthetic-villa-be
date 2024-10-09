'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let RepayRecordSchema = new Schema({
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointments'
  },
  relatedTreatmentSelection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentSelections'
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  paidAmount: {
    type: Number
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('RepayRecords', RepayRecordSchema);

//Author: Kyaw Zaw Lwin
