"use strict";

const therapist = require("../controllers/therapistController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/therapist')
        .post(verifyToken, catchError(therapist.createTherapist))
        .put(verifyToken, catchError(therapist.updateTherapist))
        
    app.route('/api/therapist/:id')
        .get(verifyToken, catchError(therapist.getTherapist))
        .delete(verifyToken, catchError(therapist.deleteTherapist)) 
        .post(verifyToken, catchError(therapist.activateTherapist))

    app.route('/api/therapists').get(verifyToken, catchError(therapist.listAllTherapists))
    app.route('/api/therapists/comissions/create').post(verifyToken, catchError(therapist.createComission))
    app.route('/api/therapists/comissions/search').get(verifyToken, catchError(therapist.searchCommission))
    app.route('/api/therapists/comissions/collect').post(verifyToken, catchError(therapist.collectComission))

};
