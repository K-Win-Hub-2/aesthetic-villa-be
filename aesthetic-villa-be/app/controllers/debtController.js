'use strict';
const Debt = require('../models/debt');
const TreatmentVoucher = require('../models/treatmentVoucher');
const AccountingList = require('../models/accountingList');
const Transaction = require('../models/transaction');
const Patient = require('../models/patient');
const Cash = require('../models/cash');
const Bank = require('../models/bank');
const Repay = require('../models/repay');

exports.listAllDebts = async (req, res) => {
    try {
        const { isPaid, relatedPatient, relatedTreatmentVoucher, relatedMedicineSale, fromDate, toDate } = req.query
        let query = { isDeleted: false }
        relatedPatient ? query.relatedPatient = relatedPatient : ""
        relatedTreatmentVoucher ? query.relatedTreatmentVoucher = relatedTreatmentVoucher : ""
        relatedMedicineSale ? query.relatedMedicineSale = relatedMedicineSale : ""
        fromDate && toDate ? query.createdAt = { "$gte": new Date(fromDate) , "$lte":new Date(toDate) } 
          : fromDate ? query.createdAt = { "$gte": new Date(fromDate) }  : toDate ? query.createdAt = { "$lte": new Date(toDate) }
          :""
        if (isPaid) query.isPaid = isPaid
        let result = await Debt.find(query)
                                .populate("relatedPatient relatedTreatmentVoucher relatedMedicineSale")
                                .populate({
                                    path: "repay",
                                    populate:{
                                    path:"repayId",  
                                    populate:[
                                        {
                                        path: "relatedTreatmentVoucher"
                                        },
                                        {
                                            path: "relatedPatient"
                                        },
                                        {
                                            path: "relatedBank"
                                        },
                                        {
                                            path: "relatedCash"
                                        },
                                    ]
                                    }
                                    })
        let count = await Debt.find(query).count();
        res.status(200).send({
            success: true,
            count: count,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getDebt = async (req, res) => {
    const result = await Debt.find({ relatedPatient: req.params.id, isDeleted: false }).populate('relatedPatient relatedTreatmentVoucher relatedMedicineSale');
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createDebt = async (req, res, next) => {
    try {
        const newDebt = new Debt(req.body);
        const result = await newDebt.save();
        res.status(200).send({
            message: 'Debt create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateDebt = async (req, res, next) => {
    try {
        const { relatedTreatmentVoucher, relatedBank, relatedCash, paidAmount, date, remark, relatedPatient , tsType} = req.body
        let Balance 
        let voucherPaid
        if (relatedBank) {
            const repay = await Repay.create({
                "relatedTreatmentVoucher": relatedTreatmentVoucher,
                "relatedPatient": relatedPatient,
                "balance": paidAmount,
                "remark": remark,
                "date": date,
                "relatedBank": relatedBank,
            })
            const transaction = await Transaction.create({
                "amount": paidAmount,
                "date": date,
                "remark": remark,
                "type": "Debit",
                "relatedBank": relatedBank,
                "relatedCash": relatedCash,
            })
            const result = await Debt.findByIdAndUpdate(
                                req.body.id ,
                                {
                                $inc: { 
                                    balance : - paidAmount
                                },
                                $push: {
                                  repay: { repayId : repay._id }
                                },
                                new: true
                                },
                              );
                              console.log("result is ",result)

            if ( tsType === "MS"  || tsType === "Combined" ) {
                Balance = { msBalance : - paidAmount, msPaidAmount : +paidAmount} 
            }
            else if ( tsType === "TS" || tsType === "TSMulti" ){
                Balance = { balance : - paidAmount, totalPaidAmount : +paidAmount} 
            } 
            else if ( tsType === "PS" ) {
                Balance = { psBalance : - paidAmount, psPaidAmount : +paidAmount} 
            }
            const updateVoucher = await TreatmentVoucher.findByIdAndUpdate( relatedTreatmentVoucher , {
                $push:{ repay: { repayId : repay._id }},
                $inc: Balance
            });
            const update = await AccountingList.findOneAndUpdate({ _id: relatedBank }, { $inc : {amount: paidAmount },  new: true  })
            const increaseBank = await Bank.findByIdAndUpdate(relatedBank,{$inc:{ balance : paidAmount }})
        }
        if (relatedCash) {
            const repay = await Repay.create({
                "relatedTreatmentVoucher": relatedTreatmentVoucher,
                "relatedPatient": relatedPatient,
                "balance": paidAmount,
                "date": date,
                "remark": remark,
                "relatedCash": relatedCash,
            })
            const transaction = await Transaction.create({
                "amount": paidAmount,
                "date": date,
                "remark": remark,
                "type": "Debit",
                "relatedBank": relatedBank,
                "relatedCash": relatedCash,
            })
            
            const result = await Debt.findByIdAndUpdate(
                req.body.id ,
                {
                $inc: { 
                    balance : - paidAmount
                },
                $push: {
                    repay: { repayId : repay._id }
                },
                new: true
                },
              );
              if ( tsType === "MS"  || tsType === "Combined" ) {
                Balance = { msBalance : - paidAmount, msPaidAmount : +paidAmount} 
            }
            else if ( tsType === "TS" || tsType === "TSMulti" ){
                Balance = { balance : - paidAmount, totalPaidAmount : +paidAmount} 
            } 
            else if ( tsType === "PS" ) {
                Balance = { psBalance : - paidAmount, psPaidAmount : +paidAmount} 
            }
            const updateVoucher = await TreatmentVoucher.findByIdAndUpdate( relatedTreatmentVoucher , {
                $push:{ repay: { repayId : repay._id }},
                $inc: Balance
            });
            const update = await AccountingList.findOneAndUpdate({ _id: relatedCash },{ $inc : {amount: paidAmount },  new: true })
            const increaseCash = await Cash.findByIdAndUpdate(relatedCash,{$inc:{ balance : paidAmount }})
        }
        if (paidAmount && relatedPatient) {
            const payDebt = await Patient.findOneAndUpdate({ _id: relatedPatient }, { $inc: { totalPaidAmount: paidAmount, debtBalance: -paidAmount } })
        }

       const queryDebt = await Debt.findById(req.body.id);
       if( queryDebt.balance === 0 ){
            await TreatmentVoucher.findByIdAndUpdate( relatedTreatmentVoucher , {
                   paymentMethod: "Paid"
                })
            await Debt.findByIdAndUpdate(
                    req.body.id ,
                    {
                    isPaid : true,
                    new: true
                    },
                  )
            voucherPaid = "Paid"
       }
        
        // const update = await TreatmentVoucher.findOneAndUpdate({ _id: relatedTreatmentVoucher }, { paymentMethod: 'Paid' }, { new: true })
        return res.status(200).send({ success: true, isPaid : voucherPaid});
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteDebt = async (req, res, next) => {
    try {
        const result = await Debt.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activateDebt = async (req, res, next) => {
    try {
        const result = await Debt.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
