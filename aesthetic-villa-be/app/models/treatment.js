'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let TreatmentSchema = new Schema({
  treatmentCode: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  treatmentName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TreatmentLists",
  },
  treatmentTimes: {
    type: Number,
    required: true
  },
  relatedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctors',
    // required: function() {
    //     return !this.relatedTherapist; // therapist is required if field2 is not provided
    //   }
  },
  relatedTherapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapists',
    // required: function() {
    //     return !this.relatedDoctor; // doctor is required if field2 is not provided
    //   }
  },
  procedureMedicine: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProcedureItems'
    },
    quantity: Number,
    perUsageQTY: Number
  }],
  medicineLists: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineItems'
    },
    quantity: Number,
    perUsageQTY: Number
  }],
  procedureAccessory: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccessoryItems'
    },
    quantity: Number,
    perUsageQTY: Number
  }],
  machine: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FixedAssets'
    },
    quantity: Number,
    perUsageQTY: Number,
    unit: String
  }],
  estimateTotalPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  description: {
    type: String
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patients'
  },
  relatedAppointment: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments'
  },
  status: {
    type: Boolean,
  },
  relatedAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountingLists'
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
  TCLSellingPrice:{
    type:Number
  },
  TCLEstimateTotalPrice:{
    type:Number
  }
});

module.exports = mongoose.model('Treatments', TreatmentSchema);

//Author: Kyaw Zaw Lwin
