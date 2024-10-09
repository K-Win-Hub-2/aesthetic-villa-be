'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let Note = new Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    description:{
        type:String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    type:{
        type:String,
        enum:['income','balance']
    },
    item: [{
        relatedAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccountingLists'
        },
        operator: {
            type: String,
            enum: ['Plus', 'Minus']
        }
    }],
    secondaryItem: [{
        relatedAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccountingLists'
        },
        operator: {
            type: String,
            enum: ['Plus', 'Minus']
        }
    }],
    name: {
        type: String
    }
});

module.exports = mongoose.model('Notes', Note);

//Author: Kyaw Zaw Lwin
