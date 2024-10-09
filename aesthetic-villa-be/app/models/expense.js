'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let ExpenseSchema = new Schema({
    relatedAccounting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists',
        required: true
    },
    date: {
        type: Date,
    },
    remark: {
        type: String,
    },
    initialAmount: {
        type: Number,
    },
    initialCurrency: {
        type: String,
    },
    finalAmount: {
        type: Number,
    },
    finalCurrency: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedCredit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedBankAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedCashAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
});

module.exports = mongoose.model('Expenses', ExpenseSchema);

//Author: Kyaw Zaw Lwin
