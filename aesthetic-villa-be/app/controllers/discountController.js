'use strict';
const Discount = require('../models/discount');

exports.listAllDiscounts = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = {isDeleted:false},
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await Discount.find(query).populate('relatedFOCID')
        count = await Discount.find(query).count();
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

exports.getDiscount = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query._id = req.params.id
    const result = await Discount.find(query).populate({
        path:'relatedFOCID',
        model:'Treatments',
        populate:{
            path:'treatmentName',
            model:'TreatmentLists'
        }

    })
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createDiscount = async (req, res, next) => {
    let newBody = req.body;
    try {
        const newDiscount = new Discount(newBody);
        const result = await newDiscount.save();
        res.status(200).send({
            message: 'Discount create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateDiscount = async (req, res, next) => {
    try {
        const result = await Discount.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate({
            path:'relatedFOCID',
            model:'Treatments',
            populate:{
                path:'treatmentName',
                model:'TreatmentLists'
            }

        })
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteDiscount = async (req, res, next) => {
    try {
        const result = await Discount.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateDiscount = async (req, res, next) => {
    try {
        const result = await Discount.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
