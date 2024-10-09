"use strict";

const supplierCreditList = require("../controllers/supplierCreditListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/supplier-credit-list')
        .post(verifyToken, catchError(supplierCreditList.createSupplierCreditList))
        .put(verifyToken, catchError(supplierCreditList.updateSupplierCreditList))
        
    app.route('/api/supplier-credit-list/:id')
        .get(verifyToken, catchError(supplierCreditList.getSupplierCreditList))
        .delete(verifyToken, catchError(supplierCreditList.deleteSupplierCreditList)) 
        .post(verifyToken, catchError(supplierCreditList.activateSupplierCreditList))

    app.route('/api/supplier-credit-lists').get(verifyToken, catchError(supplierCreditList.listAllSupplierCreditLists))
};
