'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let ProcedureHistorySchema = new Schema({
    diagnosis: {
        type: String
    },
    remark: {
        type: String
    },
    medicineItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        qty: Number,
        duration: Number,
        dose: String,
        totalQTY: Number,
        subTotal: Number,
        SIG: String,
        subSIG: String,
        remark: String
    }],
    // treatmentPackages: [{
    //     item_id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Treatments'
    //     },
    //     qty: Number,
    //     price: Number,
    //     totalPrice: Number,
    //     SIG: String
    // }],
    customTreatmentPackages: {
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Treatments'
        }
    },
    status: {
        type: String,
        enum: ['Finished']
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Date,
        default: Date.now()
    },
    before: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Attachments'
    },
    after: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Attachments'
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    },
    relatedTreatmentSelection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections'
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    complaint: {
        type: String
    },
    improvement: {
        type: String
    },
    remark: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('ProcedureHistories', ProcedureHistorySchema);

//Author: Kyaw Zaw Lwin
