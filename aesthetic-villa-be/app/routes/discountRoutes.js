"use strict";

const discount = require("../controllers/discountController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/discount')
        .post( verifyToken, catchError(discount.createDiscount))
        .put( verifyToken, catchError(discount.updateDiscount))

    app.route('/api/discount/:id')
        .get( verifyToken, catchError(discount.getDiscount))
        .delete( verifyToken, catchError(discount.deleteDiscount))
        .post( verifyToken, catchError(discount.activateDiscount))

    app.route('/api/discounts').get( verifyToken, catchError(discount.listAllDiscounts))

};
