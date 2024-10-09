"use strict";

const trialBalance = require("../controllers/trialBalanceController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/trial-balance')
        .get(verifyToken, catchError(trialBalance.trialBalance))
        
    app.route('/api/trial-balance/type')
        .get( verifyToken, catchError(trialBalance.trialBalanceWithType))
};
