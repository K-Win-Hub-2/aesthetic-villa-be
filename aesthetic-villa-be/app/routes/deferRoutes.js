"use strict";

const defer = require("../controllers/deferController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/defer')
        .post(verifyToken, catchError(defer.createDefer))
        .put(verifyToken, catchError(defer.updateDefer))
        
    app.route('/api/defer/:id')
        .get( verifyToken, catchError(defer.getDefer))
        .delete(verifyToken, catchError(defer.deleteDefer)) 
        .post( verifyToken, catchError(defer.activateDefer))

    app.route('/api/defers').get(verifyToken, catchError(defer.listAllDefers))
};
