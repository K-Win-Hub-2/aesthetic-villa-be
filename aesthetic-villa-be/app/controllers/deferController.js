'use strict';
const Defer = require('../models/defer');
const Transaction = require('../models/transaction');

exports.listAllDefers = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 20; //limit
    skip = +skip || 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    let result = await Defer.find(query).populate('relatedMedicineSale')
    console.log(result)
    count = await Defer.find(query).count();
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

exports.getDefer = async (req, res) => {
  const result = await Defer.find({ _id: req.params.id, isDeleted: false }).populate('relatedMedicineSale')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createDefer = async (req, res, next) => {
  try {
    //first transaction 
    const fTransaction = new Transaction({
      "amount": req.body.deferredAmount,
      "date": req.body.deferredDate,
      "remark": req.body.remark,
      "relatedAccounting": "6423eb525fb841d5566db371", //Sales-Package Debit
      "type": "Debit"
    })
    const fTransResult = await fTransaction.save()
    const secTransaction = new Transaction(
      {
        "amount": req.body.deferredAmount,
        "date": req.body.deferredDate,
        "remark": req.body.remark,
        "relatedAccounting": "6423fcdf54015805ecc45917", //Sales Package Deferred Revenue
        "type": "Credit",
        "relatedTransaction": fTransResult._id
      }
    )
    const secTransResult = await secTransaction.save()
    const fTransUpdate = await Transaction.findOneAndUpdate(
      { _id: fTransResult._id },
      {
        relatedTransaction: secTransResult._id
      }
    )
    const newBody = req.body;
    const newDefer = new Defer(newBody);
    const result = await newDefer.save();
    res.status(200).send({
      message: 'Defer create success',
      success: true,
      data: result,
      first: fTransResult,
      second: secTransResult
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateDefer = async (req, res, next) => {
  try {
    const result = await Defer.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedMedicineSale')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteDefer = async (req, res, next) => {
  try {
    const result = await Defer.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateDefer = async (req, res, next) => {
  try {
    const result = await Defer.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
