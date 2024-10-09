'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SupplierPaidCreditSchema = new Schema({
  relatedSupplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Suppliers'
  },
  relatedPurchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchases'
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paidAmount: {
    type: Number
  },
  leftAmount: {
    type: Number
  },
  remark: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('SupplierPaidCredits', SupplierPaidCreditSchema);

//Author: Kyaw Zaw Lwin
