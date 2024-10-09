'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let StockSchema = new Schema({
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  relatedProcedureItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcedureItems'
  },
  relatedMedicineItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineItems'
  },
  relatedAccessoryItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessoryItems'
  },
  relatedMachine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FixedAssets'
  },
  currentQty: {
    type: Number
  },
  fromUnit: {
    type: Number
  },
  toUnit: {
    type: Number
  },
  totalUnit: {
    type: Number
  },
  reOrderQuantity: {
    type: Number
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
});

module.exports = mongoose.model('Stocks', StockSchema);

//Author: Kyaw Zaw Lwin
