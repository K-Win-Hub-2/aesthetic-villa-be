"use strict";

const accessoryItem = require("../controllers/accessoryItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/accessory-item')
        .post(verifyToken, catchError(accessoryItem.createAccessoryItem))
        .put(verifyToken, catchError(accessoryItem.updateAccessoryItem))
        
    app.route('/api/accessory-item/:id')
        .get(verifyToken, catchError(accessoryItem.getAccessoryItem))
        .delete(verifyToken, catchError(accessoryItem.deleteAccessoryItem)) 
        .post(verifyToken, catchError(accessoryItem.activateAccessoryItem))

    app.route('/api/accessory-items').get(verifyToken, catchError(accessoryItem.listAllAccessoryItems))
    app.route('/api/accessory-items/:id').get(verifyToken, catchError(accessoryItem.getRelatedAccessoryItem))
    app.route('/api/accessory-items-search').post(verifyToken, catchError(accessoryItem.searchAccessoryItems))
    };
