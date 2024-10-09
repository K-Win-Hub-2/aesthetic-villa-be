"use strict";

const comission = require("../controllers/comissionController");
const treatmentVoucher = require("../controllers/treatmentVoucherController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/comission')
        .post(verifyToken, catchError(comission.createComission))
        .put(verifyToken, catchError(comission.updateComission))

    app.route('/api/comission/:id')
        .get(verifyToken, catchError(comission.getComission))
        .delete(verifyToken, catchError(comission.deleteComission))
        .post(verifyToken, catchError(comission.activateComission))

    app.route('/api/comissions').get(verifyToken, catchError(comission.listAllComissiones))
    app.route('/api/comissions/search').get(verifyToken, catchError(comission.searchCommission))
    app.route('/api/comissions/collect').post(verifyToken, catchError(comission.collectComission))
    app.route("/api/comissions/export/all").post( catchError(treatmentVoucher.getAppointByDoctorId))
};
