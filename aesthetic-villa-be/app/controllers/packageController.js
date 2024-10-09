'use strict';
const Package = require('../models/package');

exports.listAllPackages = async (req, res) => {
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
        let result = await Package.find(query).populate('relatedTreatments relatedDiscount').populate('createdBy', 'givenName')
        count = await Package.find(query).count();
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

exports.getPackage = async (req, res) => {
    try {
        let query = { isDeleted: false }
        if (req.params.id) query._id = req.params.id
        const result = await Package.find(query).populate('relatedTreatments relatedDiscount').populate('createdBy', 'givenName')
        if (result.length === 0)
            return res.status(500).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
};

exports.createPackage = async (req, res, next) => {
    let newBody = req.body;
    newBody = { ...newBody, createdBy: req.credentials.id }
    try {
        const newPackage = new Package(newBody);
        const result = await newPackage.save();
        res.status(200).send({
            message: 'Package create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updatePackage = async (req, res, next) => {
    try {
        const result = await Package.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedTreatments relatedDiscount').populate('createdBy', 'givenName')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deletePackage = async (req, res, next) => {
    try {
        const result = await Package.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activatePackage = async (req, res, next) => {
    try {
        const result = await Package.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
