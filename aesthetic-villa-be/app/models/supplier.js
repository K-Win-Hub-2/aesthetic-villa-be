'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let SupplierSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String
  },
  phone: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
  },
  creditAmount: {
    type: Number,
    default: 0
  },
  purchaseAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
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

module.exports = mongoose.model('Suppliers', SupplierSchema);

//Author: Kyaw Zaw Lwin
