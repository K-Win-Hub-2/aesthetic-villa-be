"use strict";

const currency = require("../controllers/currencyController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/currency')
        .post( verifyToken, catchError(currency.createCurrency))
        .put(verifyToken, catchError(currency.updateCurrency))

    app.route('/api/currency/:id')
        .get(verifyToken, catchError(currency.getCurrency))
        .delete(verifyToken, catchError(currency.deleteCurrency))
        .post(verifyToken, catchError(currency.activateCurrency))

    app.route('/api/currencies').get( verifyToken, catchError(currency.listAllCurrencys))
};
