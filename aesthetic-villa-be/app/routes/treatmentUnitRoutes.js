"use strict";

const treatmentUnit = require("../controllers/treatmentUnitController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/treatment-unit')
        .post(verifyToken, catchError(treatmentUnit.createTreatmentUnit))
        .put(verifyToken, catchError(treatmentUnit.updateTreatmentUnit))
        
    app.route('/api/treatment-unit/:id')
        .get(verifyToken, catchError(treatmentUnit.getTreatmentUnit))
        .delete(verifyToken, catchError(treatmentUnit.deleteTreatmentUnit)) 
        .post(verifyToken, catchError(treatmentUnit.activateTreatmentUnit))

    app.route('/api/treatment-units').get(verifyToken, catchError(treatmentUnit.listAllTreatmentUnits))

};
