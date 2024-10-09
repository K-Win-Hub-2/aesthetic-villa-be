"use strict";

const doctor = require("../controllers/doctorController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/doctor')
        .post(verifyToken, catchError(doctor.createDoctor))
        .put( verifyToken, catchError(doctor.updateDoctor))
        
    app.route('/api/doctor/:id')
        .get(verifyToken, catchError(doctor.getDoctor))
        .delete( verifyToken, catchError(doctor.deleteDoctor)) 
        .post( verifyToken, catchError(doctor.activateDoctor))

    app.route('/api/doctors').get(verifyToken, catchError(doctor.listAllDoctors))

};
