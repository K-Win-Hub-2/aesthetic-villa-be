'use strict';
const AccountingList = require('../models/accountingList');

exports.listAllAccountingLists = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = { isDeleted: false },
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await AccountingList.find(query).skip(skip).populate('relatedType relatedHeader relatedTreatment relatedBank')
        count = await AccountingList.find(query).count();
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

exports.getAccountingList = async (req, res) => {
    const result = await AccountingList.find({ _id: req.params.id, isDeleted: false }).populate('relatedType relatedHeader relatedTreatment relatedBank')
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createAccountingList = async (req, res, next) => {
    try {
        const newBody = req.body;
        const newAccountingList = await new AccountingList(newBody).populate('relatedType relatedHeader');
        const result = await newAccountingList.save();
        res.status(200).send({
            message: 'AccountingList create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error)
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateAccountingList = async (req, res, next) => {
    try {
        const result = await AccountingList.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedType relatedHeader relatedTreatment relatedBank')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteAccountingList = async (req, res, next) => {
    try {
        const result = await AccountingList.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateAccountingList = async (req, res, next) => {
    try {
        const result = await AccountingList.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.getAccountingListByRelatedHeader = async (req, res) => {
    try {
        const result = await AccountingList.find({ relatedHeader: req.params.id, isDeleted: false });
        return res.status(200).send({ success: true, data: result })
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
}
