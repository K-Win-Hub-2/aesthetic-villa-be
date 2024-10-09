"use strict";

const packages = require("../controllers/packageController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/package')
        .post(verifyToken, catchError(packages.createPackage))
        .put(verifyToken, catchError(packages.updatePackage))

    app.route('/api/package/:id')
        .get(verifyToken, catchError(packages.getPackage))
        .delete(verifyToken, catchError(packages.deletePackage))
        .post(verifyToken, catchError(packages.activatePackage))

    app.route('/api/packages').get(verifyToken, catchError(packages.listAllPackages))

};
