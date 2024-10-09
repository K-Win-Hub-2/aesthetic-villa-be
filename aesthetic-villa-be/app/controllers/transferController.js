'use strict';
const Transfer = require('../models/transfer');
const AccList = require('../models/accountingList');
const Transaction = require('../models/transaction');

exports.listAllTransfers = async (req, res) => {
  try {
    let result = await Transfer.find({ isDeleted: false }).populate({
      path: 'fromAcc',
      model: 'AccountingLists',
      populate: {
        path: 'relatedType',
        model: 'AccountTypes'
      }
    }).populate({
      path: 'toAcc',
      model: 'AccountingLists',
      populate: {
        path: 'relatedType',
        model: 'AccountTypes'
      }
    })
    let count = await Transfer.find({ isDeleted: false }).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.transferFilter = async (req, res) => {
  try {
    let query = { isDeleted: false }
    let { start, end } = req.query
    if (start && end) query.date = { $gte: start, $lte: end }
    const result = await Transfer.find(query)
  } catch (error) {
    //console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.getTransfer = async (req, res) => {
  const result = await Transfer.find({ _id: req.params.id, isDeleted: false }).populate('fromAcc toAcc')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTransfer = async (req, res, next) => {
  const newBody = req.body;
  try {
    const newTransfer = new Transfer(req.body);
    const result = await newTransfer.save();
    const fromAccUpdate = await AccList.findOneAndUpdate(
      { _id: req.body.fromAcc },
      { $inc: { amount: -req.body.amount } },
      { new: true },
    );
    const toAccUpdate = await AccList.findOneAndUpdate(
      { _id: req.body.toAcc },
      { $inc: { amount: req.body.amount } },
      { new: true },
    );
    const firstTransaction =
    {
      "amount": newBody.amount,
      "date": newBody.date,
      "remark": newBody.remark,
      "type": "Credit",
      "relatedTransaction": null,
      "relatedAccounting": newBody.fromAcc
    }
    const fTransaction = new Transaction(firstTransaction)
    const fTransResult = await fTransaction.save();
    const secondTransaction = {
      "amount": newBody.amount,
      "date": newBody.date,
      "remark": newBody.remark,
      "type": "Debit",
      "relatedTransaction": fTransResult._id,
      "relatedAccounting": newBody.toAcc,
    }
    const secTrans = new Transaction(secondTransaction)
    var secTransResult = await secTrans.save();
    var fTransUpdate = await Transaction.findOneAndUpdate(
      { _id: fTransResult._id },
      {
        relatedTransaction: secTransResult._id
      },
      { new: true }
    )
    res.status(200).send({
      message: 'Transfer create success',
      success: true,
      data: result,
      ftrans: fTransUpdate,
      sTrans: secTransResult,
      fAcc: fromAccUpdate,
      tAcc: toAccUpdate
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTransfer = async (req, res, next) => {
  try {
    const result = await Transfer.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('fromAcc toAcc')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTransfer = async (req, res, next) => {
  try {
    const result = await Transfer.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateTransfer = async (req, res, next) => {
  try {
    const result = await Transfer.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
