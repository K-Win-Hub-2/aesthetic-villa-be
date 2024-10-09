'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let DeferSchema = new Schema({
  relatedPatientTreatment: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'PatientTreatments',
    required:true
  },
  leftOverAmount: {
    type:Number,

  },
  deferredAmount: {
    type:Number
  },
  deferredDate: {
    type:Date,

  },
  remark: {
    type:String
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('Defers', DeferSchema);

//Author: Kyaw Zaw Lwin
