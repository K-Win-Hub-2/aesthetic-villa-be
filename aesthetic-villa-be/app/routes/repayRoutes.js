"use strict";

const repay = require("../controllers/repayController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    //repay list
    app.route('/api/repaies').get(verifyToken, catchError(repay.listAllRepay))
    //filter repay's bank and cash and calculation
    app.route("/api/repay/filter").get(verifyToken, catchError(repay.filterRepayAmount))
    //repay delete
    app.route('/api/repay/:id').put(verifyToken, catchError(repay.deleteRepay))


};
