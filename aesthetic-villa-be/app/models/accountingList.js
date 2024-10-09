'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let AccountingListSchema = new Schema({
    code: {
        type: String
    },
    relatedType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountTypes'
    },
    relatedHeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountHeaders'
    },
    subHeader: {
        type: String
    },
    name: {
        type: String
    },
    relatedTreatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatments',
    },
    amount: {
        type: Number
    },
    openingBalance: {
        type: Number
    },
    generalFlag: {
        type: Boolean
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    relatedCurrency: {
        type: String
    },
    carryForWork: {
        type: Boolean
    },
    relatedBank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Banks'
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    accountNature: {
        type: String,
        enum: ['Credit', 'Debit']
    }
});

module.exports = mongoose.model('AccountingLists', AccountingListSchema);

//Author: Kyaw Zaw Lwin
