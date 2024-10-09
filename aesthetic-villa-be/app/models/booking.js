"use strict"

const mongoose = require("mongoose");
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');

let BookingSchema = new Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Treatments"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    },
    phone: {
        type: Number
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            isAsync: true,
            validator: validator.isEmail,
            message: "Invalid Email Address."
        }
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctors"
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
    },
    time: {
        type: String
    },
    createdAt: {
        type:Date,
        default: Date.now
    }

})

module.exports = mongoose.model( "Bookings",BookingSchema )