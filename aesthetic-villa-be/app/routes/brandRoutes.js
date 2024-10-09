"use strict";

const { verify } = require("crypto");
const brand = require("../controllers/brandController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/brand')
        .post(verifyToken, catchError(brand.createBrand))
        .put(verifyToken, catchError(brand.updateBrand))

    app.route('/api/brand/:id')
        .get(verifyToken, catchError(brand.getBrand))
        .delete(verifyToken, catchError(brand.deleteBrand))
        .post(verifyToken, catchError(brand.activateBrand))

    app.route('/api/brands').get(verifyToken, catchError(brand.listAllBrands))

    app.route('/api/brands-filter')
        .get(verifyToken, catchError(brand.filterBrands))

    app.route('/api/brands-search')
        .post(verifyToken, catchError(brand.searchBrands))
};
