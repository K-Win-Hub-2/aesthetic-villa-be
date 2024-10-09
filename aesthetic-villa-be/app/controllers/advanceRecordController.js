'use strict';
const AdvanceRecord = require('../models/advanceRecord');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');

exports.listAllAdvanceRecords = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = req.mongoQuery,
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await AdvanceRecord.find({ amount: { $gt: 0 }, isDeleted: false }).populate('relatedPatient recievedPatient relatedBank relatedCash')
        count = await AdvanceRecord.find(query).count();
        const division = count / limit;
        page = Math.ceil(division);

        res.status(200).send({
            success: true,
            count: count,
            _metadata: {
                current_page: skip / limit + 1,
                per_page: limit,
                page_count: page,
                total_count: count,
            },
            list: result,
        });
    } catch (e) {
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.getAdvanceRecord = async (req, res) => {
    try {
        let query = req.mongoQuery
        if (req.params.id) query._id = req.params.id
        const result = await AdvanceRecord.find(query).populate('relatedPatient recievedPatient relatedBank relatedCash')
        if (result.length === 0)
            return res.status(500).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
};

exports.createAdvanceRecord = async (req, res, next) => {
    let newBody = req.body;
    let createdBy = req.credentials.id
    newBody = { ...newBody, createdBy: req.credentials.id }
    try {
        const newAdvanceRecord = new AdvanceRecord(newBody);
        const result = await newAdvanceRecord.save();
        var fTransResult = await Transaction.create({
            "amount": req.body.amount,
            "date": Date.now(),
            "remark": null,
            "relatedAccounting": "6467379159a9bc811d97f4d2", //Advance received from customer
            "type": "Credit",
            "createdBy": createdBy
        })
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: "6467379159a9bc811d97f4d2" },
            { $inc: { amount: req.body.amount } }
        )
        //sec transaction
        var secTransResult = await Transaction.create({
            "amount": req.body.amount,
            "date": Date.now(),
            "remark": null,
            "relatedBank": req.body.relatedBank,
            "relatedCash": req.body.relatedCash,
            "type": "Debit",
            "relatedTransaction": fTransResult._id,
            "createdBy": createdBy
        });
        var fTransUpdate = await Transaction.findOneAndUpdate(
            { _id: fTransResult._id },
            {
                relatedTransaction: secTransResult._id
            },
            { new: true }
        )
        if (req.body.relatedBank) {
            var amountUpdate = await Accounting.findOneAndUpdate(
                { _id: req.body.relatedBank },
                { $inc: { amount: req.body.amount } }
            )
        } else if (req.body.relatedCash) {
            var amountUpdate = await Accounting.findOneAndUpdate(
                { _id: req.body.relatedCash },
                { $inc: { amount: req.body.amount } }
            )
        }
        res.status(200).send({
            message: 'AdvanceRecord create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateAdvanceRecord = async (req, res, next) => {
    try {
        const result = await AdvanceRecord.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedPatient recievedPatient relatedBank relatedCash')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteAdvanceRecord = async (req, res, next) => {
    try {
        const result = await AdvanceRecord.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateAdvanceRecord = async (req, res, next) => {
    try {
        const result = await AdvanceRecord.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
