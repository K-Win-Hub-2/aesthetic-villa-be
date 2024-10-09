"use strict";

const fixedAsset = require("../controllers/fixedAssetController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/fixed-asset')
        .post(verifyToken, catchError(fixedAsset.createFixedAsset))
        .put(verifyToken, catchError(fixedAsset.updateFixedAsset))

    app.route('/api/fixed-asset/:id')
        .get(verifyToken, catchError(fixedAsset.getFixedAsset))
        .delete(verifyToken, catchError(fixedAsset.deleteFixedAsset))
        .post(verifyToken, catchError(fixedAsset.activateFixedAsset))

    app.route('/api/fixed-assets/entry').get(verifyToken, catchError(fixedAsset.fixedAssetForcedEntry))

    app.route('/api/fixed-assets').get(verifyToken, catchError(fixedAsset.listAllFixedAssets))
};
