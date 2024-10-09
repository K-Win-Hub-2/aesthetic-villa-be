'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let SubHeaderSchema = new Schema({
    code: {
        type: String,
    },
    name: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    description: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    updatedAt: {
        type: Date,
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
});

module.exports = mongoose.model('SubHeaders', SubHeaderSchema);

//Author: Kyaw Zaw Lwin
