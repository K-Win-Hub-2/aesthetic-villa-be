"use strict";

const procedureAccessory = require("../controllers/procedureAccessoryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/procedure-accessory')
        .post(verifyToken, catchError(procedureAccessory.createProcedureAccessory))
        .put(verifyToken, catchError(procedureAccessory.updateProcedureAccessory))
        
    app.route('/api/procedure-accessory/:id')
        .get(verifyToken, catchError(procedureAccessory.getProcedureAccessory))
        .delete(verifyToken, catchError(procedureAccessory.deleteProcedureAccessory)) 
        .post(verifyToken, catchError(procedureAccessory.activateProcedureAccessory))

    app.route('/api/procedure-accessories').get(verifyToken, catchError(procedureAccessory.listAllProcedureAccessorys))

    app.route('/api/procedure-accessories-search').post(verifyToken, catchError(procedureAccessory.searchProcedureAccessories))
};
