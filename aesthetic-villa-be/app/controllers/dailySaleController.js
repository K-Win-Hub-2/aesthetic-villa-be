const TreatmentVoucher = require("../models/treatmentVoucher")
const moment = require("moment")
exports.listTodaySale = async (req,res) => {
    const {date} = req.query
    const query = { isDeleted: false, Refund: false }
    let response ={}
    const startDate = new Date(date)
    const endDate = new Date( startDate.getFullYear(),
     startDate.getMonth(),
     startDate.getDate() + 1,
     startDate.getHours(),
     startDate.getMinutes(),
     startDate.getSeconds(),
     startDate.getMilliseconds()
    )
    query.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(endDate)
    }
    try{
       const treatmentVoucherIncome = await TreatmentVoucher.find(query)
       const result = treatmentVoucherIncome.reduce(( result, {secondAmount,totalPaidAmount,msPaidAmount,psPaidAmount}) => {
        console.log("result ",result,secondAmount,totalPaidAmount,msPaidAmount,psPaidAmount)
         return result + (secondAmount || 0) + (totalPaidAmount || 0) + (msPaidAmount || 0) + (psPaidAmount || 0)
       },0)
       const today = startDate.getDate()
       response[today] = result
       res.status(200).send({
        success: true,
        data: response
       })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}

exports.listAllDailySale = async(req,res) => {
    try {
        let {dates} = req.query
        let response = []
        let totalByDate = {}
        let query = { isDeleted: false, Refund: false }
        let today = new Date(dates)
        const firstDate = moment(today).startOf('month').format('YYYY-MM-DD');
        const lastDate=moment(today).endOf('month').format("YYYY-MM-DD");
        query.createdAt = { $gte: new Date(firstDate) , $lte: new Date(lastDate) }
        console.log("query is ",query)
        let results = await TreatmentVoucher.find(query).sort({createdAt: 1})
        let data = results.reduce((result,{ createdAt, secondAmount, totalPaidAmount, msPaidAmount, psPaidAmount })=>{
             let queryDate = new Date(createdAt)
             let thisDay = queryDate.getDate()
             totalByDate[thisDay] = ( totalByDate[thisDay] || 0 ) + ( secondAmount || 0 ) 
                                    + ( totalPaidAmount || 0 ) + ( msPaidAmount || 0 ) + ( psPaidAmount || 0)
             return totalByDate ;
        },0)
        response.push(data)
        res.status(200).send({
            success: true,
            data: response
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}