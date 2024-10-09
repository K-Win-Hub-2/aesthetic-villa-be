"use strict";

const profitAndLoss = require("../controllers/porfitAndLossController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app.route('/api/profit-and-loss').get(verifyToken, catchError(profitAndLoss.listAllLog))
    app.route('/api/profit-and-losses/week').post(verifyToken, catchError(profitAndLoss.getWeek))
    app.route('/api/profit-and-losses/month').post(verifyToken, catchError(profitAndLoss.getMonth))
    app.route('/api/profit-and-losses/day').post(verifyToken, catchError(profitAndLoss.getDay))
    app.route('/api/profit-and-losses/total').get(verifyToken, catchError(profitAndLoss.getTotal))
    app.route('/api/profit-and-losses/total/branch').get(verifyToken, catchError(profitAndLoss.getTotalwithBranch))
    app.route('/api/profit-and-losses/total-filter').get(verifyToken, catchError(profitAndLoss.getTotalWithDateFilter))

    // app.route('/api/profit-and-losses/month').post(catchError(profitAndLoss.createUsage))
};
