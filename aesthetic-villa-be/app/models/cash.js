'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let CashSchema = new Schema({
  relatedAccounting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists',
    required: true
  },
  relatedCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currencies',
    required: true
  },
  name: {
    type: String
  },
  amount: {
    type: Number
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

module.exports = mongoose.model('Cashes', CashSchema);

//Author: Kyaw Zaw Lwin
