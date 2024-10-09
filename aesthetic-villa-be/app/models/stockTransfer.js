'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let StockTransferSchema = new Schema({
    procedureMedicine: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcedureItems'
        },
        stockQty: Number,
        requestedQty: Number,
        transferQty: Number,
        purchasePrice: Number
    }],
    medicineLists: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        stockQty: Number,
        requestedQty: Number,
        transferQty: Number,
        purchasePrice: Number
    }],
    procedureAccessory: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AccessoryItems'
        },
        stockQty: Number,
        requestedQty: Number,
        transferQty: Number,
        purchasePrice: Number
    }],
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    date: {
        type: Date
    },
    requestNo: {
        type: String
    },
    requestedBy: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    seq: {
        type: Number
    }

});

module.exports = mongoose.model('StockTransfers', StockTransferSchema);

//Author: Kyaw Zaw Lwin
