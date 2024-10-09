"use strict";

const appointment = require("../controllers/appointmentController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/appointment')
        .post(verifyToken, catchError(appointment.createAppointment))
        .put(verifyToken, catchError(appointment.updateAppointment))
        
    app.route('/api/appointment/:id')
        .get(verifyToken, catchError(appointment.getAppointment))
        .delete(verifyToken, catchError(appointment.deleteAppointment)) 
        .post(verifyToken, catchError(appointment.activateAppointment))

    app.route('/api/appointments-filter')
        .get(verifyToken, catchError(appointment.filterAppointments))

    app.route('/api/appointments').get(verifyToken, catchError(appointment.listAllAppointments))
    app.route('/api/appointment-search')
        .post(verifyToken, catchError(appointment.searchAppointment))

    app.route('/api/appointments/today')
        .get(verifyToken, catchError(appointment.getTodaysAppointment))
};
