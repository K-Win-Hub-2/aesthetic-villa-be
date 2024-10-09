"use strict";

const saleReturn = require("../controllers/saleReturnController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/sale-return')
        .post( verifyToken, catchError(saleReturn.createSaleReturn))
        .put( verifyToken, catchError(saleReturn.updateSaleReturn))

    app.route('/api/sale-return/:id')
        .get( verifyToken, catchError(saleReturn.getSaleReturn))
        .delete( verifyToken, catchError(saleReturn.deleteSaleReturn))
        .post( verifyToken, catchError(saleReturn.activateSaleReturn))

    app.route('/api/sale-returns').get( verifyToken, catchError(saleReturn.listAllSaleReturns))

};
