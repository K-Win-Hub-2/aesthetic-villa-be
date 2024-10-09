'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let ComissionPaySchema = new Schema({
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    collectAmount: {
        type: Number
    },
    collectDate: {
        type: Date,
        default: Date.now()
    },
    remark: {
        type: String
    },
    relatedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctors',
    },
    relatedCommissions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Commissions',
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('ComissionPays', ComissionPaySchema);
