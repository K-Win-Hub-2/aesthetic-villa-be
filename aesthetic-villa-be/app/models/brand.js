'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let BrandSchema = new Schema({
  code: {
    type: String
  },
  name: {
    type: String
  },
  category: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Categories'
  },
  subCategory: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'SubCategories'
  },
  description: {
    type:String
  },
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

module.exports = mongoose.model('Brands', BrandSchema);

//Author: Kyaw Zaw Lwin
