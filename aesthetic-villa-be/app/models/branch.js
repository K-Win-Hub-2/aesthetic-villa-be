'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let BranchSchema = new Schema({
  name: {
    type: String
  },
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  }
});

module.exports = mongoose.model('Branches', BranchSchema);

//Author: Kyaw Zaw Lwin
