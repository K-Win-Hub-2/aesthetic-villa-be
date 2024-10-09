'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let Member = new Schema({
    relatedDiscount: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Discounts'
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    conditionAmount: {
        type: Number,
    },
    conditionPurchaseFreq: {
        type: Number,
    },
    conditionPackageQty: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
});

module.exports = mongoose.model('Members', Member);

//Author: Kyaw Zaw Lwin
