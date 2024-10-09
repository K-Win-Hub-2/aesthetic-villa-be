"use strict";

const subCategory = require("../controllers/subCategoryController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {

    app.route('/api/sub-category')
        .post(verifyToken, catchError(subCategory.createSubCategory))
        .put(verifyToken, catchError(subCategory.updateSubCategory))
        
    app.route('/api/sub-category/:id')
        .get(verifyToken, catchError(subCategory.getSubCategory))
        .delete(verifyToken, catchError(subCategory.deleteSubCategory)) 
        .post(verifyToken, catchError(subCategory.activateSubCategory))

    app.route('/api/sub-categories').get(verifyToken, catchError(subCategory.listAllSubCategories))

};
