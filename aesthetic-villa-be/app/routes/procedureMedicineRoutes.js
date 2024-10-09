"use strict";

const procedureMedicine = require("../controllers/procedureMedicineController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/procedure-medicine')
        .post(verifyToken, catchError(procedureMedicine.createMedicineProcedure))
        .put(verifyToken, catchError(procedureMedicine.updateMedicineProcedure))
        
    app.route('/api/procedure-medicine/:id')
        .get(verifyToken, catchError(procedureMedicine.getMedicineProcedure))
        .delete(verifyToken, catchError(procedureMedicine.deleteMedicineProcedure)) 
        .post(verifyToken, catchError(procedureMedicine.activateMedicineProcedure))

    app.route('/api/procedure-medicines').get(verifyToken, catchError(procedureMedicine.listAllMedicineProcedure))

    app.route('/api/procedure-medicines-search').post(verifyToken, catchError(procedureMedicine.searchProcedureMedicine))

};
