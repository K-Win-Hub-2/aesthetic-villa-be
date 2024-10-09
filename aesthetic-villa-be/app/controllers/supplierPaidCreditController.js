'use strict';
const SupplierPaidCredit = require('../models/supplierPaidCredit');

exports.listAllSupplierPaidCredits = async (req, res) => {
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
    let result = await SupplierPaidCredit.find(query).populate('relatedAccounting');
    console.log(result)
    count = await SupplierPaidCredit.find(query).count();
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

exports.getSupplierPaidCredit = async (req, res) => {
  const result = await SupplierPaidCredit.find({ _id: req.params.id,isDeleted:false }).populate('relatedAccounting')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createSupplierPaidCredit = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newSupplierPaidCredit = new SupplierPaidCredit(newBody);
    const result = await newSupplierPaidCredit.save();
    res.status(200).send({
      message: 'SupplierPaidCredit create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateSupplierPaidCredit = async (req, res, next) => {
  try {
    const result = await SupplierPaidCredit.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccounting');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteSupplierPaidCredit = async (req, res, next) => {
  try {
    const result = await SupplierPaidCredit.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateSupplierPaidCredit = async (req, res, next) => {
  try {
    const result = await SupplierPaidCredit.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
