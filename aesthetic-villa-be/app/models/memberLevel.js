"use strict";

const mongoose = require("mongoose");
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let MemberLevelSchema = new Schema({
  createdAt: {
    type: Date,
  },
  levelName: {
    type: String,
  },
  percent: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    enum: ["PerVoucherAmount", "TotalAmount"],
    required: true,
  },
  description: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = mongoose.model("MemberLevel", MemberLevelSchema);

//Author: Kaung Set
