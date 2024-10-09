"use strict";

const medicineList = require("../controllers/medicineListController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/medicine-list')
        .post( verifyToken, catchError(medicineList.createMedicineList))
        .put(verifyToken, catchError(medicineList.updateMedicineList))
        
    app.route('/api/medicine-list/:id')
        .get(verifyToken, catchError(medicineList.getMedicineList))
        .delete(verifyToken, catchError(medicineList.deleteMedicineList)) 
        .post(verifyToken, catchError(medicineList.activateMedicineList))

    app.route('/api/medicine-lists').get(verifyToken, catchError(medicineList.listAllMedicineLists))

    app.route('/api/medicine-lists-search').post(verifyToken, catchError(medicineList.searchMedicineLists))

};
