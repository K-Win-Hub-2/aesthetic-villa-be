"use strict";

const supplierPaidCredit = require("../controllers/supplierPaidCreditController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/supplier-paid-credit')
        .post(verifyToken, catchError(supplierPaidCredit.createSupplierPaidCredit))
        .put(verifyToken, catchError(supplierPaidCredit.updateSupplierPaidCredit))
        
    app.route('/api/supplier-paid-credit/:id')
        .get(verifyToken, catchError(supplierPaidCredit.getSupplierPaidCredit))
        .delete(verifyToken, catchError(supplierPaidCredit.deleteSupplierPaidCredit)) 
        .post(verifyToken, catchError(supplierPaidCredit.activateSupplierPaidCredit))

    app.route('/api/supplier-paid-credits').get(verifyToken, catchError(supplierPaidCredit.listAllSupplierPaidCredits))
};
