"use strict";

const cash = require("../controllers/cashController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/cash')
        .post(verifyToken, catchError(cash.createCash))
        .put(verifyToken, catchError(cash.updateCash))
        
    app.route('/api/cash/:id')
        .get(verifyToken, catchError(cash.getCash))
        .delete(verifyToken, catchError(cash.deleteCash)) 
        .post(verifyToken, catchError(cash.activateCash))


    app.route('/api/cashes').get( verifyToken, catchError(cash.listAllCashes))

};
