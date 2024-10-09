'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let VoucherSchema = new Schema({
  voucherType: {
    type: String,
  },
  voucherCode: {
    type: String,
  },
  date: {
    type: Date,
  },
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patients',
  },
  medicineSaleItems: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItems'
    },
    quantity: Number,
    discount: Number
  }],
  totalAmount: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  grandTotal: {
    type: Number,
  },
  paymentMethod: {
    type: String,
    enum: ['Bank', 'Cash Down']
  },
  relatedAccounting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accounting'
  },
  remark: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatments',
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('Vouchers', VoucherSchema);

//Author: Kyaw Zaw Lwin
