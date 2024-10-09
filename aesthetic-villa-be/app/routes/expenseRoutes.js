"use strict";

const { verify } = require("crypto");
const expense = require("../controllers/expenseController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/expense')
        .post(verifyToken, catchError(expense.createExpense))
        .put(verifyToken, catchError(expense.updateExpense))

    app.route('/api/expense/:id')
        .get(verifyToken, catchError(expense.getExpense))
        .delete(verifyToken, catchError(expense.deleteExpense))
        .post(verifyToken, catchError(expense.activateExpense))

    app.route('/api/expenses').get(verifyToken, catchError(expense.listAllExpenses))
    app.route('/api/expenses/get-date').get(verifyToken, catchError(expense.getwithExactDate))
    app.route('/api/expenses/filter').get(verifyToken, catchError(expense.expenseFilter))
    app.route('/api/expenses-filter')
        .get(verifyToken, catchError(expense.filterExpense))

    app.route('/api/expenses-search')
        .get(verifyToken, catchError(expense.searchExpense))
};
