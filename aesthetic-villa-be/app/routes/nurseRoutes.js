"use strict";

const nurse = require("../controllers/nurseController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/nurse')
        .post( verifyToken, catchError(nurse.createNurse))
        .put( verifyToken, catchError(nurse.updateNurse))

    app.route('/api/nurse/:id')
        .get( verifyToken, catchError(nurse.getNurse))
        .delete( verifyToken, catchError(nurse.deleteNurse))
        .post( verifyToken, catchError(nurse.activateNurse))

    app.route('/api/nurses').get( verifyToken, catchError(nurse.listAllNurses))

};
