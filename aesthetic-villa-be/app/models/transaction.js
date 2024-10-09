'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TransactionSchema = new Schema({
  relatedAccounting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists'
  },
  amount: {
    type: Number,
  },
  date: {
    type: Date,
  },
  remark: {
    type: String
  },
  type: {
    type: String,
    enum: ['Debit', 'Credit'],
    // required:true,
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatments',
  },
  relatedBank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists',
  },
  relatedCash: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists',
  },
  treatmentFlag: {
    type: Boolean,
    // required:true
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transactions',
    default: null
  },
  isDeleted: {
    type: Boolean,
    // required:true,
    default: false
  },
  relatedMedicineSale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineSales',
    default: null
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  relatedIncome:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Incomes'
  },
  relatedExpense:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Expenses'
  }
});

module.exports = mongoose.model('Transactions', TransactionSchema);

//Author: Kyaw Zaw Lwin
