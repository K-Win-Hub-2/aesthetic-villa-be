"use strict";

const stock = require("../controllers/stockController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app.route('/api/stocks/reorder').get(verifyToken, catchError(stock.checkReorder))

};
