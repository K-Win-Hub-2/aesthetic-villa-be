'use strict';
const Supplier = require('../models/supplier');
const PaidCredit = require('../models/supplierPaidCredit')

exports.listAllSuppliers = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 20; //limit
    skip = +skip || 0;
    let query = {isDeleted:false},
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await Supplier.find(query)
    console.log(result)
    count = await Supplier.find(query).count();
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

exports.getSupplier = async (req, res) => {
  const result = await Supplier.find({ _id: req.params.id,isDeleted:false })
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createSupplier = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newSupplier = new Supplier(newBody);
    const result = await newSupplier.save();
    res.status(200).send({
      message: 'Supplier create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const result = await Supplier.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    )
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.paySupplier = async (req, res, next) => {
  let isPaid = false
  try {
    const { id, payAmount } = req.body;
    const creditResult = await Supplier.find({_id:req.body.id})
    let newCreditAmount = parseInt(creditResult[0].creditAmount) - parseInt(payAmount);
    if (newCreditAmount === 0) isPaid = true
    
    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id },
      { $inc: { creditAmount: -payAmount }, status:isPaid },
      { new: true }
    );

    const createSupplierPaidCredit = await PaidCredit.create({
      relatedSupplier:req.body.relatedSupplier,
      relatedPurchase:req.body.relatedPurchase,
      paidAmount:payAmount,
      leftAmount:updatedSupplier.creditAmount,
      remark:req.body.remark
    })
    return res.status(200).json({ success: true, data: updatedSupplier, paidCredit:createSupplierPaidCredit });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const result = await Supplier.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateSupplier = async (req, res, next) => {
  try {
    const result = await Supplier.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
