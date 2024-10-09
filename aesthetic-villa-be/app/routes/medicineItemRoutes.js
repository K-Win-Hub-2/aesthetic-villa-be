"use strict";

const medicineItem = require("../controllers/medicineItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-item')
        .post(verifyToken, catchError(medicineItem.createMedicineItem))
        .put(verifyToken, catchError(medicineItem.updateMedicineItem))
        
    app.route('/api/medicine-item/:id')
        .get(verifyToken, catchError(medicineItem.getMedicineItem))
        .delete(verifyToken, catchError(medicineItem.deleteMedicineItem)) 
        .post(verifyToken, catchError(medicineItem.activateMedicineItem))

    app.route('/api/medicine-items').get(verifyToken, catchError(medicineItem.listAllMedicineItems))

    app.route('/api/medicine-items/:id').get(verifyToken, catchError(medicineItem.getRelatedMedicineItem))

    app.route('/api/medicine-items-search').post(verifyToken, catchError(medicineItem.searchMedicineItems))

};
