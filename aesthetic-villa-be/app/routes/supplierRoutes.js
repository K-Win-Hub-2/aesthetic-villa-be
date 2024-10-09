"use strict";

const supplier = require("../controllers/supplierController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/supplier')
        .post(verifyToken, catchError(supplier.createSupplier))
        .put(verifyToken, catchError(supplier.updateSupplier))
        
    app.route('/api/supplier/:id')
        .get(verifyToken, catchError(supplier.getSupplier))
        .delete(verifyToken, catchError(supplier.deleteSupplier)) 
        .post(verifyToken, catchError(supplier.activateSupplier))

    app.route('/api/suppliers').get(verifyToken, catchError(supplier.listAllSuppliers))

    app.route('/api/suppliers/pay').put(verifyToken, catchError(supplier.paySupplier))
};
