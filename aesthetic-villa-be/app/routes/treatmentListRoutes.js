"use strict";

const treatmentList = require("../controllers/treatmentListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/treatment-list')
        .post(verifyToken, catchError(treatmentList.createTreatmentList))
        .put(verifyToken, catchError(treatmentList.updateTreatmentList))
        
    app.route('/api/treatment-list/:id')
        .get(verifyToken, catchError(treatmentList.getTreatmentList))
        .delete(verifyToken, catchError(treatmentList.deleteTreatmentList)) 
        .post(verifyToken, catchError(treatmentList.activateTreatmentList))

    app.route('/api/treatment-lists').get(verifyToken, catchError(treatmentList.listAllTreatmentLists))

    app.route('/api/treatment-lists-filter')
        .get(verifyToken, catchError(treatmentList.filterTreatmentLists))

    app.route('/api/treatment-lists-search')
        .post(verifyToken, catchError(treatmentList.searchTreatmentLists))
        
    app.route('/api/treatment-lists/treatment/:id').get(verifyToken, catchError(treatmentList.getRelatedTreatments))
};
