"use strict";

const packageSelection = require("../controllers/packageSelectionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');
const treatment = require("../models/treatment");
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/package-selection')
        .post(verifyToken, upload, catchError(packageSelection.createPackageSelection))
        .put(verifyToken, catchError(packageSelection.updatePackageSelection))

    app.route('/api/package-selection/:id')
        .get(verifyToken, catchError(packageSelection.getPackageSelection))
        .delete(verifyToken, catchError(packageSelection.deletePackageSelection))
        .post(verifyToken, catchError(packageSelection.activatePackageSelection))

    app.route('/api/package-selections').get(verifyToken, catchError(packageSelection.listAllPackageSelections))

    app.route('/api/package-selections/transaction').post(verifyToken, catchError(packageSelection.createTreatmentTransaction))
    app.route('/api/package-selections/treatment/:id').get(verifyToken, catchError(packageSelection.getTreatementSelectionByTreatmentID))
    app.route('/api/package-selections/payment').put(verifyToken, upload, catchError(packageSelection.treatmentPayment))
    app.route('/api/package-selections/filter').post(verifyToken, catchError(packageSelection.getRelatedPackageSelections))
    app.route('/api/package-selections/search').post(verifyToken, catchError(packageSelection.searchPackageSelections))
    app.route('/api/package-selections/code').get(verifyToken, catchError(packageSelection.createPackageSelectionCode))
    app.route('/api/package-selections/generate').post(verifyToken, catchError(packageSelection.appointmentGenerate))
    app.route('/api/package-selections/appointment').get(verifyToken, catchError(packageSelection.getAppointmentsForPackageSelection))


};
