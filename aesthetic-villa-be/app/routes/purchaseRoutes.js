"use strict";

const purchase = require("../controllers/purchaseController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/purchase')
        .post(verifyToken, catchError(purchase.createPurchase))
        .put(verifyToken, catchError(purchase.updatePurchase))
        
    app.route('/api/purchase/:id')
        .get(verifyToken, catchError(purchase.getPurchase))
        .delete(verifyToken, catchError(purchase.deletePurchase)) 
        .post(verifyToken, catchError(purchase.activatePurchase))

    app.route('/api/purchases').get(verifyToken, catchError(purchase.listAllPurchases))
};
