"use strict";

const category = require("../controllers/categoryController");
const { catchError } = require("../lib/errorHandler");
const  verifyToken= require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/category')
        .post(verifyToken, catchError(category.createCategory))
        .put( verifyToken, catchError(category.updateCategory))
        
    app.route('/api/category/:id')
        .get(verifyToken, catchError(category.getCategory))
        .delete(verifyToken, catchError(category.deleteCategory)) 
        .post(verifyToken, catchError(category.activateCategory))

    app.route('/api/categories').get(verifyToken, catchError(category.listAllCategories))

};
