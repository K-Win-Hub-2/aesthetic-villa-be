'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SellEndSchema = new Schema({
  flag: {
    type: String,
    enum: ['Sell', 'End']
  },
  currentValue: {
    type: Number
  },
  sellPrice: {
    type: Number
  },
  sellDate: {
    type: Date
  },
  profitAndLoss: {
    type: Number
  },
  relatedFixedAsset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FixedAssets'
  },
  usedYears: {
    type: Number
  },
  remaniningYears: {
    type: Number
  },
  remark: {
    type: String
  },
  endDate: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedAccounting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists'
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('SellEnds', SellEndSchema);

//Author: Kyaw Zaw Lwin
