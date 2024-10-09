"use strict";

const voucher = require("../controllers/voucherController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/voucher')
        .post( verifyToken, catchError(voucher.createVoucher))       
        .put( verifyToken, catchError(voucher.updateVoucher))

    app.route('/api/voucher/:id')
        .get( verifyToken, catchError(voucher.getVoucher))
        .delete( verifyToken, catchError(voucher.deleteVoucher))
        .post( verifyToken, catchError(voucher.activateVoucher))

    app.route('/api/vouchers').get( verifyToken, catchError(voucher.listAllVouchers))

    app.route('/api/vouchers/validate')
        .post( verifyToken, catchError(voucher.createVoucherWithValidation))
};
