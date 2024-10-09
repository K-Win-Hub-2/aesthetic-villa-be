"use strict";

const bank = require("../controllers/bankController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/bank')
        .post(verifyToken, catchError(bank.createBank))
        .put(verifyToken, catchError(bank.updateBank))
        
    app.route('/api/bank/:id')
        .get(verifyToken, catchError(bank.getBank))
        .delete(verifyToken, catchError(bank.deleteBank)) 
        .post(verifyToken, catchError(bank.activateBank))

    app.route('/api/banks').get(verifyToken, catchError(bank.listAllBanks))
};
