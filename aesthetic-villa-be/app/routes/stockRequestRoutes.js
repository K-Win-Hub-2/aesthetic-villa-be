"use strict";

const stockRequest = require("../controllers/stockRequestController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/stock-request')
        .post(verifyToken, catchError(stockRequest.createStockRequest))
        .put(verifyToken, catchError(stockRequest.updateStockRequest))

    app.route('/api/stock-request/:id')
        .get(verifyToken, catchError(stockRequest.getStockRequest))
        .delete(verifyToken, catchError(stockRequest.deleteStockRequest))
        .post(verifyToken, catchError(stockRequest.activateStockRequest))

    app.route('/api/stock-requests').get(verifyToken, catchError(stockRequest.listAllStockRequests))
    app.route('/api/stock-requests/code').get(verifyToken, catchError(stockRequest.generateCode))
};
