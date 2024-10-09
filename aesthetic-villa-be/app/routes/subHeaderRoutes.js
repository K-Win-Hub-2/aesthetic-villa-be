"use strict";

const subHeader = require("../controllers/subHeaderController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/sub-header')
        .post(verifyToken, catchError(subHeader.createSubHeader))
        .put(verifyToken, catchError(subHeader.updateSubHeader))
        
    app.route('/api/sub-header/:id')
        .get( verifyToken, catchError(subHeader.getSubHeader))
        .delete(verifyToken, catchError(subHeader.deleteSubHeader)) 
        .post( verifyToken, catchError(subHeader.activateSubHeader))

    app.route('/api/sub-headers').get(verifyToken, catchError(subHeader.listAllSubHeaders))
};
