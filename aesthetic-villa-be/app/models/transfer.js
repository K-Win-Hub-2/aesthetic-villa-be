'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TransferSchema = new Schema({
  fromAcc: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists'
  },
  toAcc: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists'
  },
  date: {
    type:Date,
    required:true
  },
  remark: {
    type: String
  },
  amount: {
    type: Number
  },
  isDeleted: {
    type:Boolean,
    // required:true,
    default:false
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('Transfers', TransferSchema);

//Author: Kyaw Zaw Lwin
