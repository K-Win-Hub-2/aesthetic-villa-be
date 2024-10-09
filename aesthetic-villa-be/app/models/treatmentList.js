'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentListSchema = new Schema({
  code: {
    type: String,
  },
  name: {
    type: String,
  },
  bodyParts: {
    type:String,
    enum:['Treatment','Hair,Combine Tre & Facial','Injection','Combination Package','Surgery Price List'],
  },
  description: {
    type:String,
  },
  updatedAt: {
    type: Date
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

module.exports = mongoose.model('TreatmentLists', TreatmentListSchema);

//Author: Kyaw Zaw Lwin
