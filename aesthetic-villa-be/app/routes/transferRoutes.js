"use strict";

const transfer = require("../controllers/transferController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/transfer')
        .post(verifyToken, catchError(transfer.createTransfer))
        .put( verifyToken, catchError(transfer.updateTransfer))
        
    app.route('/api/transfer/:id')
        .get(verifyToken, catchError(transfer.getTransfer))
        .delete(verifyToken, catchError(transfer.deleteTransfer)) 
        .post(verifyToken, catchError(transfer.activateTransfer))

    app.route('/api/transfers').get(verifyToken, catchError(transfer.listAllTransfers))

};
