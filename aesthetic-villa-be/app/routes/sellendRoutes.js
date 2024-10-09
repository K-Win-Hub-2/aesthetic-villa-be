"use strict";

const sellend = require("../controllers/sellendController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/sellend')
        .post(verifyToken, catchError(sellend.createSellEnd))
        .put(verifyToken, catchError(sellend.updateSellEnd))
        
    app.route('/api/sellend/:id')
        .get(verifyToken, catchError(sellend.getSellEnd))
        .delete(verifyToken, catchError(sellend.deleteSellEnd)) 
        .post(verifyToken, catchError(sellend.activateSellEnd))

    app.route('/api/sellends').get(verifyToken, catchError(sellend.listAllSellEnds))
};
