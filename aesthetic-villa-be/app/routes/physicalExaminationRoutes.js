"use strict";

const physicalExamination = require("../controllers/physicalExaminationController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/physical-examination')
        .post(verifyToken, catchError(physicalExamination.createPhysicalExamination))
        .put(verifyToken, catchError(physicalExamination.updatePhysicalExamination))

    app.route('/api/physical-examination/:id')
        .get(verifyToken, catchError(physicalExamination.getPhysicalExamination))
        .delete(verifyToken, catchError(physicalExamination.deletePhysicalExamination))
        .post(verifyToken, catchError(physicalExamination.activatePhysicalExamination))

    app.route('/api/physical-examinations').get(verifyToken, catchError(physicalExamination.listAllPhysicalExaminations))

    app.route('/api/physical-examinations-filter')
        .get(verifyToken, catchError(physicalExamination.filterPhysicalExaminations))

    app.route('/api/physical-examinations-search')
        .post(verifyToken, catchError(physicalExamination.searchPhysicalExaminations))
};
