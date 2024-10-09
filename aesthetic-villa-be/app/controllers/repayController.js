const Repay = require("../models/repay");

exports.listAllRepay = async (req,res,next) => {
  
    let { keyword, role, limit, skip, relatedPatient, relatedBank, relatedCash, relatedTreatmentVoucher, fromDate, toDate } = req.query
    let count = 0
    let page = 0
    try {
        console.log("from Date is ",fromDate)
        console.log("to Date is ", toDate)
        skip = +skip || 0
        let query = { isDeleted:false },
                     regexKeyword;
        role ? ( query["role"] = role.toUpperCase()) : "";
        keyword &&  /\w/.test(keyword) ? regexKeyword = new RegExp( keyword, "i" ) : ""
        regexKeyword ? query.name = regexKeyword : ""
        relatedPatient ? query.relatedPatient = relatedPatient : ""
        relatedBank ? query.relatedBank = relatedBank : ""
        relatedCash ? query.relatedCash = relatedCash : ""
        fromDate && toDate ? query.date = { "$gte": new Date(fromDate) , "$lte":new Date(toDate) } 
          : fromDate ? query.date = { "$gte": new Date(fromDate) }  : toDate ? query.date = { "$lte": new Date(toDate) }
          :""
        relatedTreatmentVoucher ? query.relatedTreatmentVoucher = relatedTreatmentVoucher : ""
        let result = await Repay.find(query).populate("relatedPatient relatedBank relatedCash")
                                            .populate({
                                                path:"relatedTreatmentVoucher",
                                                populate:{
                                                    path:"relatedPatient"
                                                }
                                            })
        count = await Repay.find(query).count();
        res.status(200).send({
            success: true,
            count: count,
            list: result,
            })
    } catch (e) {
        return res.status(500).send({ error:true, message: e.message })
    }
}

exports.filterRepayAmount = async ( req, res, next ) => {
    let query = { isDeleted: false, relatedCash: {"$exists":true} };

    let { relatedPatient, relatedTreatmentVoucher, fromDate, toDate  } = req.query;
    let response = {};
    let bankList = []
    let bankTotal = {}
    relatedPatient ? query.relatedPatient = relatedPatient : ""
    // relatedBank ? query.relatedBank = relatedBank : ""
    // relatedCash ? query.relatedCash = relatedCash : ""
    fromDate && toDate ? query.date = { "$gte": new Date(fromDate) , "$lte":new Date(toDate) } 
      : fromDate ? query.date = { "$gte": new Date(fromDate) }  : toDate ? query.date = { "$lte": new Date(toDate) }
      :""
    relatedTreatmentVoucher ? query.relatedTreatmentVoucher = relatedTreatmentVoucher : ""
    let cashResult = await Repay.find(query).populate("relatedCash")
    if(cashResult.length !=0){
        let cash = cashResult.reduce((total , addAmount) => {
            return total + (addAmount.balance || 0 );
        }, 0)
        response.cash = cash
        response.cashName = cashResult[0].relatedCash.name
    }
    let { relatedCash, ...query2 } = query
    query2.relatedBank = { "$exists" : true }
    let bankResult = await Repay.find(query2).populate("relatedBank")
    if(bankResult.length !=0){
        let bank = bankResult.reduce( ( total, { balance, relatedBank } ) => {
            bankTotal[relatedBank.name] = (bankTotal[relatedBank.name] || 0) + balance
            return bankTotal;
        } , 0)
        bankList.push(bank)
        response.bank = bankList
    }
    return res.status(200)
           .send({
            success: true,
            data: response
           })

}

exports.deleteRepay = async (req, res, next) => {
    try {
        const result = await Repay.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200)
                  .send({ 
                    success: true, 
                    message: "Repay is successfully deleted" });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};