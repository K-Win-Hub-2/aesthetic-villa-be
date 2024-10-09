"use strict";

const advanceRecords = require("../controllers/advanceRecordController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/advance-record')
        .post(verifyToken, catchError(advanceRecords.createAdvanceRecord))
        .put(verifyToken, catchError(advanceRecords.updateAdvanceRecord))

    app.route('/api/advance-record/:id')
        .get(verifyToken, catchError(advanceRecords.getAdvanceRecord))
        .delete(verifyToken, catchError(advanceRecords.deleteAdvanceRecord))
        .post(verifyToken, catchError(advanceRecords.activateAdvanceRecord))

    app.route('/api/advance-records').get(verifyToken, catchError(advanceRecords.listAllAdvanceRecords))

};
