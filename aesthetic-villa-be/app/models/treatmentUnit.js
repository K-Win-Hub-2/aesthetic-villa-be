'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentUnitSchema = new Schema({
  code: {
    type: String,
  },
  name: {
    type: String,
  },
  procedureMedicine: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'ProcedureMedicines' //array of objectIDss
  },
  machine: {
    type: [mongoose.Schema.Types.ObjectId], //array of objectIDs
  },
  estimateCost: {
    type: Number
  },
  sellingPrice: {
    type: Number,
  },
  description: {
    type: String,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  patientTreatmentID: {
    type: String,
  },
  seq: {
    type: Number,
    required: true,
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('TreatmentUnits', TreatmentUnitSchema);

//Author: Kyaw Zaw Lwin
