'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let MedicineItemSchema = new Schema({
  code: {
    type: String
  },
  medicineItemName: {
    type: String
  },
  name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineLists'
  },
  currentQuantity: {
    type: Number
  },
  purchasePrice: {
    type: Number
  },
  sellingPrice: {
    type: Number
  },
  description: {
    type: String,
  },
  fromUnit: {
    type: String,
  },
  toUnit: {
    type: String
  },
  totalUnit: {
    type: Number
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  reOrderQuantity: {
    type: Number
  },
  perUnitQuantity: {
    type: Number
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
  unit: {
    type: String
  },
  itemType: {
    type: String,
    enum: ['Oral', 'Topical', 'Cosmetic', 'Consignment','Accessories']
  },
    //for stock balance
    purchaseQty: {
      type: Number,
      default: 0
    },
    useQty: {
      type: Number,
      default: 0
    },
    openingQty: {
      type: Number,
      default: 0
   },
   closingQty: {
     type: Number,
     default: 0
  }
});

module.exports = mongoose.model('MedicineItems', MedicineItemSchema);

//Author: Kyaw Zaw Lwin
