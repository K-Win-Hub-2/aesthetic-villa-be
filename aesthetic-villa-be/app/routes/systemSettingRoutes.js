"use strict";

const systemSetting = require("../controllers/systemSettingController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/system-setting')
        .post(verifyToken, catchError(systemSetting.createSystemSetting))
        .put(verifyToken, catchError(systemSetting.updateSystemSetting))

    app.route('/api/system-setting/:id')
        .get(verifyToken, catchError(systemSetting.getSystemSetting))
        .delete(verifyToken, catchError(systemSetting.deleteSystemSetting))
        .post(verifyToken, catchError(systemSetting.activateSystemSetting))

    app.route('/api/system-settings').get(verifyToken, catchError(systemSetting.listAllSystemSettings))
};
