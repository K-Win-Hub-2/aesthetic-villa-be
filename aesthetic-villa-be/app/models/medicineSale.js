'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let MedicineSaleSchema = new Schema({
  voucherCode: {
    type:String
  },
  createdBy: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Users'
  },
  createdAt: {
    type:Date
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Treatments'
  },
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Patients',
    required: true,
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Appointments'
  },
  remark: {
    type:String,
  },
  totalAmount: {
    type:Number,
  },
  discount: {
    type: Number
  },
  grandTotal: {
    type:Number
  },
  payAmount: {
    type:Number
  },
  change: {
    type:Number
  },
  paymentMethod: {
    type:String,
    enum:["Cash Down","Bank Transition"],
  },
  relatedBank: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists'
  },
  medicineItems: [{
    item_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MedicineItems'
    },
    quantity:Number,
    discount:Number
  }],
  isDeleted: {
    type:Boolean,
    required:true,
    default:false
  },
  seq:{
    type:Number
  },
  relatedCash: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists'
  },
  relatedAccount: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'AccountingLists'
  },
  createdBy: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Users'
  },
  relatedTransaction:{
    type:[mongoose.Schema.Types.ObjectId],
    ref:'Transactions'
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
});

module.exports = mongoose.model('MedicineSales', MedicineSaleSchema);

//Author: Kyaw Zaw Lwin
