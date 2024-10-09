'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentVoucherSchema = new Schema({
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    secondAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    secondAmount: {
        type: Number,
        default: 0
    },
    secondBankType: {
        type: String,
        enum: ['Normal', 'POS', 'Pay']
    },
    isDouble: {
        type: Boolean
    },
    createdAt: {
        type: Date,
    },
    permissionDate: {
        type: Date,
        default: Date.now
    },
    Refund : {
        type: Boolean,
        default: false
    },
    refundType : {
        type: String,
        enum:["CashBack","Treatment"],
    },
    refundDate : {
        type:Date,
        default:Date.now
    },
    refundReason : {
        type: String,
    },
    refundAccount : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "AccountingLists"
    },
    cashBackAmount : {
        type :Number,
        default:0
    },
    newTreatmentVoucherCode : {
        type:String,
        
    },
    newTreatmentVoucherId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TreatmentVouchers"
    },
    refundAmount : {
        type: Number,
        default:0
     },
     treatmentReturn : {
         type: Boolean,
         default: false
     },
    relatedTherapist:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Therapists"
    },
    relatedTreatment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Treatments'
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointments'
    },
    relatedPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patients'
    },
    paymentMethod: {
        type: String,
        enum: ['Paid', 'Partial', 'FOC']
    },
    relatedPackageSelection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PackageSelections'
    },
    relatedPackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Packages'
    },
    code: {
        type: String
    },
    relatedBank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    relatedCash: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    paymentType: {
        type: String,
        enum: ['Bank', 'Cash']
    },
    seq: {
        type: Number
    },
    relatedTreatmentSelection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TreatmentSelections'
    }],
    remark: {
        type: String
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
    },
    bankType: {
        type: String,
        enum: ['Normal', 'POS', 'Pay']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    relatedAccounting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AccountingLists'
    },
    saleReturnType: {
        type: Boolean,
        default: false
    },
    remark: {
        type: String
    },
    totalDiscount: {
        type: Number
    },
    totalAmount: {
        type: Number
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number
    },
    msBalance: {
        type: Number
    },
    totalPaidAmount: {
        type: Number,
        default: 0
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachments'
    },
    relatedDiscount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discounts'
    },
    discountAmount: {
        type: Number
    },
    discountType: {
        type: Number
    },
    tsType: {
        type: String,
        enum: ['TS', 'TSMulti', 'MS', 'Combined', 'PS']
    },
    msTotalAmount: {
        type: Number,
        default: 0
    },
    msTotalDiscountAmount: {
        type: Number
    },
    msPaidAmount: {
        type: Number
    },
    msChange: {
        type: Number
    },
    msGrandTotal: {
        type: Number
    },
    msBalance: {
        type: Number
    },
    multiTreatment: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Treatments'
        },
        discountAmount: Number,
        price: Number,
        qty: Number
    }],
    tvDiscount: {
        type: Number
    },
    amount: {
        type: Number
    },
    psGrandTotal: {
        type: Number
    },
    psBalance: {
        type: Number
    },
    psPaidAmount: {
        type: Number
    },
    repay: [{
        repayId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Repaies'  
        }
    }],
    medicineItems: [{
        item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MedicineItems'
        },
        qty: Number,
        price: Number,
        discountAmount: Number
    }],
    relatedTransaction: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Transactions'
    },
    relatedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctors'
    },
    purchaseType: {
        type: String,
        enum: ['Clinic', 'Surgery']
    },
    deposit: {
        type: Number
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attachments'
    }
});

module.exports = mongoose.model('TreatmentVouchers', TreatmentVoucherSchema);

//Author: Kyaw Zaw Lwin
