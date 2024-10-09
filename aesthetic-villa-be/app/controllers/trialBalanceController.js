'use strict';
const Transaction = require('../models/transaction');
const AccountingList = require('../models/accountingList');

exports.trialBalance = async (req, res) => {
    let finalResult = []
    let { start, end } = req.query
    try {
        const allAccounts = await AccountingList.find({}).populate('relatedType')
        for (let i = 0; i < allAccounts.length; i++) {
            const id = allAccounts[i]._id
            let netType = '';
            let netAmount = 0;
            const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
            // if (debit.length === 0) return res.status(500).send({error:true, message:'Debit Data Not Found!'})
            const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

            const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
            // if (credit.length === 0) return res.status(500).send({error:true, message:'Credit Data Not Found!'})
            const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

            if (totalDebit === totalDebit) {
                netType = null
                netAmount = 0
            }
            netAmount = totalDebit - totalCredit
            if (netAmount > 0) netType = 'Debit'
            if (netAmount < 0) netType = 'Credit'   
            finalResult.push({ totalCredit: totalCredit, totalDebit: totalDebit, netType: netType, netAmount: netAmount, accName: allAccounts[i].name, type: allAccounts[i].relatedType })
        }
        if (allAccounts.length === finalResult.length) return res.status(200).send({ success: true, data: finalResult })
    } catch (err) {
        return res.status(500).send({ error: true, message: err.message })
    }
}

exports.trialBalanceWithType = async (req, res) => {
    let finalResult = []
    let { start, end, type } = req.query
    try {
        const allAccounts = await AccountingList.find({relatedType:type}).populate('relatedType')
        for (let i = 0; i < allAccounts.length; i++) {
            const id = allAccounts[i]._id
            let netType = '';
            let netAmount = 0;
            const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
            // if (debit.length === 0) return res.status(500).send({error:true, message:'Debit Data Not Found!'})
            const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

            const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
            // if (credit.length === 0) return res.status(500).send({error:true, message:'Credit Data Not Found!'})
            const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

            if (totalDebit === totalDebit) {
                netType = null
                netAmount = 0
            }
            netAmount = totalDebit - totalCredit
            if (netAmount > 0) netType = 'Debit'
            if (netAmount < 0) netType = 'Credit'
            finalResult.push({ totalCredit: totalCredit, totalDebit: totalDebit, netType: netType, netAmount: netAmount, accName: allAccounts[i].name, type: allAccounts[i].relatedType })
        }
        if (allAccounts.length === finalResult.length) return res.status(200).send({ success: true, data: finalResult })
    } catch (err) {
        return res.status(500).send({ error: true, message: err.message })
    }
}

