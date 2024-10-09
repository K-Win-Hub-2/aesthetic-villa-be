const DailySale = require("../controllers/dailySaleController")
const { catchError } = require("../lib/errorHandler")
const verifyToken = require("../lib/verifyToken")

module.exports = (app)=>{
    app.route("/api/daily-sale")
       .get(verifyToken,catchError(DailySale.listTodaySale))
    app.route("/api/sales-to-today")
       .get(verifyToken, catchError(DailySale.listAllDailySale))
}