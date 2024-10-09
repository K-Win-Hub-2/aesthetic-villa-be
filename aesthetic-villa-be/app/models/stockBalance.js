const mongoose = require("mongoose")
mongoose.promise = global.Promise
const Schema = mongoose.Schema

const StockBalance = new Schema({
    isDeleted: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: [ "Opening", "Closing" ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date
    },
    qty: {
        type: Number
    },
    purchaseQty: {
        type: Number,
        default: 0
    },
    receiveQty: {
        type: Number,
        default: 0
    },
    usageQty: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model( "StockBalances",StockBalance )