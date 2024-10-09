"use strict";

const stockTransfer = require("../controllers/stockTransferController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/stock-transfer')
        .post(verifyToken, catchError(stockTransfer.createStockTransfer))
        .put(verifyToken, catchError(stockTransfer.updateStockTransfer))

    app.route('/api/stock-transfer/:id')
        .get(verifyToken, catchError(stockTransfer.getStockTransfer))
        .delete(verifyToken, catchError(stockTransfer.deleteStockTransfer))
        .post(verifyToken, catchError(stockTransfer.activateStockTransfer))

    app.route('/api/stock-transfers').get(verifyToken, catchError(stockTransfer.listAllStockRequests))
    app.route('/api/stock-transfers/code').get(verifyToken, catchError(stockTransfer.generateCode))
};
