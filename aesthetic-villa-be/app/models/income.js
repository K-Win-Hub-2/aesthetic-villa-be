'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let IncomeSchema = new Schema({
    createdAt: {
        type: Date,
    },
    cashName:{
      type: String
    },
    cashAmount: {
        type: Number
    },
    firstBank:[{
        bankname: String,
        amount:Number
    }],
    secondBank:[{
        bankname: String,
        amount:Number
    }],
    secondCash:[{
        cashname: String,
        amount:Number
    }],
    month:{
        type:String,
        enum:["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"]
    },
    totalIncomeAmount:{
        type:Number
    },
    totalBankIncomeAmount:{
        type:Number
    },
    totalCashIncomeAmount:{
        type:Number
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
});

module.exports = mongoose.model('Incomes', IncomeSchema);

//Author: Kyaw Zaw Lwin
