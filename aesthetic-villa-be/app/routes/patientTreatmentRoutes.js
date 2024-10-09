"use strict";

const patientTreatment = require("../controllers/patientTreatmentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/patient-treatment')
        .post(verifyToken, catchError(patientTreatment.createPatientTreatment))
        .put(verifyToken, catchError(patientTreatment.updatePatientTreatment))
        
    app.route('/api/patient-treatment/:id')
        .get( verifyToken, catchError(patientTreatment.getPatientTreatment))
        .delete(verifyToken, catchError(patientTreatment.deletePatientTreatment)) 
        .post( verifyToken, catchError(patientTreatment.activatePatientTreatment))

    app.route('/api/patient-treatments').get(verifyToken, catchError(patientTreatment.listAllPatientTreatments))

    app.route('/api/patient-treatments/outstanding').get(verifyToken, catchError(patientTreatment.getOutstandingPatientTreatment))
    app.route('/api/patient-treatments/well-done').get(verifyToken, catchError(patientTreatment.getWellDonePatientTreatment))
};
