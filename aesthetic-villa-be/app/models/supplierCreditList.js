'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SupplierCreditListSchema = new Schema({
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
  creditAmount: {
    type: Number
  },
  paidStatus: {
    type: Boolean
  },
  isDeleted: {
    type: Boolean,
    // required:true,
    default: false
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('SupplierCreditLists', SupplierCreditListSchema);

//Author: Kyaw Zaw Lwin
