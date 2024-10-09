"use strict"
const mongoose = require("mongoose");
mongoose.promise  = global.promise;
const Schema = mongoose.Schema;

let SettingSchema = new Schema({
    deal:{
        type:String
    }
})

module.exports = mongoose.model("Settings", SettingSchema)