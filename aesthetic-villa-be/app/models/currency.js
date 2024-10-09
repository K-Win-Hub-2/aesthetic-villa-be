'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let CurrencySchema = new Schema({
  code: {
    type: String
  },
  name: {
    type: String
  },
  exchangeRate: {
    type:String, //3000 (per 1USD)
    required:true,
  },
  lastUpdate: {
    type:Date,
    default:Date.now(),
    required:true,
  },
  // description: {
  //   type:String,
  //   required:true,
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('Currencies', CurrencySchema);

//Author: Kyaw Zaw Lwin
