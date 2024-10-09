"use strict";

const treatmentVoucher = require("../controllers/treatmentVoucherController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/treatment-voucher')
        .post(verifyToken, catchError(treatmentVoucher.createTreatmentVoucher))
        .put(verifyToken, upload, catchError(treatmentVoucher.updateTreatmentVoucher))

    app.route('/api/treatment-voucher/:id')
        .get(verifyToken, catchError(treatmentVoucher.getTreatmentVoucher))
        .delete(verifyToken, catchError(treatmentVoucher.deleteTreatmentVoucher))
        .post(verifyToken, catchError(treatmentVoucher.activateTreatmentVoucher))

    app.route('/api/treatment-vouchers/excel').post(upload, verifyToken, catchError(treatmentVoucher.excelImportTreatmentVouchers))
    app.route('/api/treatment-vouchers')
        .get(verifyToken, catchError(treatmentVoucher.listAllTreatmentVouchers))
    app.route('/api/treatment-vouchers/search')
        .post(verifyToken, catchError(treatmentVoucher.searchTreatmentVoucher))
    app.route('/api/treatment-vouchers/filter')
        .post(verifyToken, catchError(treatmentVoucher.getRelatedTreatmentVoucher))
    app.route('/api/treatment-vouchers/code/ms')
        .get(verifyToken, catchError(treatmentVoucher.getCodeMS))
    app.route('/api/treatment-vouchers/code').get(verifyToken, catchError(treatmentVoucher.getCode))
    app.route('/api/treatment-vouchers/today').get(verifyToken, catchError(treatmentVoucher.getTodaysTreatmentVoucher))
    app.route('/api/treatment-vouchers/get-date').get(verifyToken, catchError(treatmentVoucher.getwithExactDate))
    app.route('/api/treatment-vouchers/TV-Filter').get(verifyToken, catchError(treatmentVoucher.TreatmentVoucherFilter))
    app.route('/api/treatment-vouchers/treatment-selection/:id').get(verifyToken, catchError(treatmentVoucher.getTreatmentVoucherWithTreatmentID))
    app.route('/api/treatment-vouchers/ms/single').post(verifyToken, upload, catchError(treatmentVoucher.createSingleMedicineSale))
    app.route('/api/treatment-vouchers/ms/combine').put(verifyToken, catchError(treatmentVoucher.combineMedicineSale))
    app.route('/api/treatment-vouchers/ms')
        .put(verifyToken, catchError(treatmentVoucher.updateMedicineSale));

    app.route('/api/treatment-vouchers/ms/:id')
        .delete(verifyToken, catchError(treatmentVoucher.deleteMS));
};
