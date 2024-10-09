'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let BankSchema = new Schema({
  bankName: {
    type: String
  },
  accountNumber: {
    type: String
  },
  accountHolderName: {
    type: String
  },
  bankContact: {
    type: String
  },
  openingDate: {
    type: Date
  },
  balance: {
    type: Number,
  },
  bankAddress: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedCurrency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Currencies'
  },
  relatedAccounting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists'
  },
  accountName: {
    type: String,
    required: true
  },
  bank: {
    type: String
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('Banks', BankSchema);

//Author: Kyaw Zaw Lwin
