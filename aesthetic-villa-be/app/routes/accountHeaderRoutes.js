"use strict";

const accountHeader = require("../controllers/accountHeaderController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/account-header')
        .post( verifyToken, catchError(accountHeader.createAccountHeader))
        .put( verifyToken, catchError(accountHeader.updateAccountHeader))

    app.route('/api/account-header/:id')
        .get( verifyToken, catchError(accountHeader.getAccountHeader))
        .delete( verifyToken, catchError(accountHeader.deleteAccountHeader))
        .post( verifyToken, catchError(accountHeader.activateAccountHeader))

    app.route('/api/account-headers').get( verifyToken, catchError(accountHeader.listAllAccountHeaders))
    app.route('/api/account-headers/related/:id').get( verifyToken, catchError(accountHeader.getRelatedAccountHeader))
};
