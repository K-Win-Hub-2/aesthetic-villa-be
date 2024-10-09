"use strict";

const debt = require("../controllers/debtController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/debt')
        .post(verifyToken, catchError(debt.createDebt))
        .put(verifyToken, catchError(debt.updateDebt))

    app.route('/api/debt/:id')
        .get(verifyToken, catchError(debt.getDebt))
        .delete(verifyToken, catchError(debt.deleteDebt)) 
        .post(verifyToken, catchError(debt.activateDebt))

    app.route('/api/debts').get(verifyToken, catchError(debt.listAllDebts))

};
