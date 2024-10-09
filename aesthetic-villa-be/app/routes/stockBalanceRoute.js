const StockBalance  = require("../controllers/stockBalanceController")
const { catchError } = require("../lib/errorHandler")
const verifyToken = require("../lib/verifyToken")

module.exports = (app) => {
    //update medicine, procedure, accessory items after a month
    app.route("/api/items/confirm")
       .put(verifyToken, catchError(StockBalance.updateItemsAfterAMonth))

    app.route("/api/stock-balances")
       .post(verifyToken, catchError(StockBalance.createStockBalance))
       .get(verifyToken, catchError(StockBalance.listAllStockBalance))

    app.route("/api/stock-balance/:id")
       .get(verifyToken, catchError(StockBalance.getStockBalanceById))
       .put(verifyToken, catchError(StockBalance.updateStockBalanceById))
       .delete(verifyToken, catchError(StockBalance.deleteStockBalanceById))

    app.route("/api/medicine-balances")
       .post(catchError(StockBalance.createOpeningClosingQty))
}