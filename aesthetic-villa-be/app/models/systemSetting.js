'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SystemSettingSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  accountingFlag: {
    type: Boolean,
    required: true,
  },
  fiscalYearStartDate: {
    type: Date,
    required: true
  },
  fiscalYearEndDate: {
    type: Date,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  mdName: {
    type: String
  },
  startingCapital: {
    type: Number
  },
  netProfitPrevious: {
    type: Number
  },
  netProfitNext: {
    type: Number
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('SystemSettings', SystemSettingSchema);

//Author: Kyaw Zaw Lwin
