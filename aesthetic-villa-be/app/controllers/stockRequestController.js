'use strict';
const StockRequest = require('../models/stockRequest');

exports.listAllStockRequests = async (req, res) => {
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
        let result = await StockRequest.find(query).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedBranch');
        count = await StockRequest.find(query).count();
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

exports.getStockRequest = async (req, res) => {
    const result = await StockRequest.find({ _id: req.params.id, isDeleted: false }).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedBranch')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createStockRequest = async (req, res, next) => {
    let newBody = req.body;
    try {

        const newStockRequest = new StockRequest(newBody);
        const result = await newStockRequest.save();
        res.status(200).send({
            message: 'StockRequest create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateStockRequest = async (req, res, next) => {
    try {
        const result = await StockRequest.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedBranch')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteStockRequest = async (req, res, next) => {
    try {
        const result = await StockRequest.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateStockRequest = async (req, res, next) => {
    try {
        const result = await StockRequest.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.generateCode = async (req, res) => {
    let data;
    try {
        const latestDocument = await StockRequest.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        console.log(latestDocument)
        if (latestDocument.length === 0) data = { ...data, seq: '1', patientID: "SR-1" } // if seq is undefined set initial patientID and seq
        console.log(data)
        if (latestDocument.length) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, patientID: "SR-" + increment, seq: increment }
        }
        return res.status(200).send({
            success: true,
            data: data
        })
    } catch (error) {
        return res.status(500).send({error:true, message:error.message})
    }
}
