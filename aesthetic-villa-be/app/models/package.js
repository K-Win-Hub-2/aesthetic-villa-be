'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');


let Package = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    relatedTreatments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Treatments'
    },
    totalprice: {
        type: Number
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    relatedDiscount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discounts'
    },
    isDeleted: {
        type: Boolean,
        default: false

    },
    totalPrice: {
        type: Number
    },
    totalCost: {
        type: Number
    },
    status: {
        type: String
    }
});

module.exports = mongoose.model('Packages', Package);

//Author: Kyaw Zaw Lwin
