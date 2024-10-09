"use strict";

const transaction = require("../controllers/transactionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
    app
    .route('/api/transactions/balance-sheet')
    .get(catchError(transaction.getBalanceSheet))
    
    app.route('/api/transaction')
        .post(verifyToken, catchError(transaction.createTransaction))
        .put(verifyToken, catchError(transaction.updateTransaction))

    app.route('/api/transactions/related/:id')
        .get(verifyToken, catchError(transaction.getRelatedTransaction))

    app.route('/api/transaction/:id')
        .get(verifyToken, catchError(transaction.getTransaction))
        .delete(verifyToken, catchError(transaction.deleteTransaction))
        .post(verifyToken, catchError(transaction.activateTransaction))

    app.route('/api/transactions/relatedExpense/:id')
        .get(catchError(transaction.getRelatedTransactionExpense))

    app.route('/api/transactions/relatedIncome/:id')
        .get(catchError(transaction.getRelatedTransactionIncome))

    app.route('/api/transactions').get(verifyToken, catchError(transaction.listAllTransactions))
    app.route('/api/transactions/trial-balance/:id').get(verifyToken, catchError(transaction.trialBalanceWithID))
    app.route('/api/transactions/trial-balance').get(catchError(transaction.trialBalance))
    app.route('/api/transactions/trial-balance/type').get(catchError(transaction.trialBalanceWithType))
    app.route('/api/transactions/income-statement').get(catchError(transaction.incomeStatement))
    app.route('/api/transactions/report').get(verifyToken, catchError(transaction.bankCashTransactionReport))
    app.route('/api/transactions/income-expnese/related').get(verifyToken, catchError(transaction.getIncomeExpense))
};
