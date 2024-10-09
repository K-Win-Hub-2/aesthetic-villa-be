const { createRefundVoucher } = require("../controllers/refundVoucherController")
const verifyToken = require("../lib/verifyToken")

module.exports = (app) => {
   
    app.route("/api/refund")
       .post(verifyToken, createRefundVoucher);
       
}
