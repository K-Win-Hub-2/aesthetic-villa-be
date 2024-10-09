"use strict";

const medicineSale = require("../controllers/medicineSaleController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-sale')
        .post(verifyToken, catchError(medicineSale.createMedicineSale))
        .put(verifyToken, catchError(medicineSale.updateMedicineSale))

        
    app.route('/api/medicine-sale/:id')
        .get(verifyToken, catchError(medicineSale.getMedicineSale))
        .delete(verifyToken, catchError(medicineSale.deleteMedicineSale)) 
        .post(verifyToken, catchError(medicineSale.activateMedicineSale))

    app.route('/api/medicine-sales').get(verifyToken, catchError(medicineSale.listAllMedicineSales))
    app.route('/api/medicine-sales/code').get(verifyToken, catchError(medicineSale.createCode))

    app.route('/api/medicine-sales/transaction').post(verifyToken, catchError(medicineSale.createMedicineSaleTransaction))
    app.route('/api/medicine-sales/filter').get( verifyToken, catchError(medicineSale.filterMedicineSales))
    app.route('/api/medicine-sales/ms-filter').get(verifyToken, catchError(medicineSale.MedicineSaleFilter))
    app.route('/api/medicine-sales/confirm').post( verifyToken, catchError(medicineSale.confirmTransaction))
    app.route('/api/medicine-sales/get-date').get(verifyToken, catchError(medicineSale.getwithExactDate))

};
