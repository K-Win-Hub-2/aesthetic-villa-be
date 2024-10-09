'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let AttachmentSchema = new Schema({
    createdDate: {
        type: Date,
        default: Date.now
    },
    imgUrl: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
    },
    image:{
        type:String
    },
    relatedBranch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branches'
      },

});

AttachmentSchema.pre('save', function (next) {
    let attachment = this;
    return next()
});

module.exports = mongoose.model('Attachments', AttachmentSchema);
