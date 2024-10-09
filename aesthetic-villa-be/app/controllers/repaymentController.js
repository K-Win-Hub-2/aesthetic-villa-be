'use strict';
const Repayment = require('../models/repayment');
const PatientTreatment = require('../models/patientTreatment');
const Transaction = require('../models/transaction');

exports.listAllRepayments = async (req, res) => {
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
    let result = await Repayment.find(query).populate('relatedPateintTreatment');
    console.log(result)
    count = await Repayment.find(query).count();
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

exports.getRepayment = async (req, res) => {
  const result = await Repayment.find({ _id: req.params.id,isDeleted:false }).populate('relatedPateintTreatment')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedPayment = async (req, res) => {
  console.log(req.params.relatedPateintTreatmentid)
  const result = await Repayment.find({ relatedPateintTreatment: req.params.relatedPateintTreatmentid,isDeleted:false }).populate('relatedPateintTreatment')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createRepayment = async (req, res, next) => {
    let data = req.body;
  try {
    data = {...data, remaningCredit:data.remaningCredit-data.repaymentAmount}

    //first transaction 
    const fTransaction = new Transaction({
      "amount": req.body.repaymentAmount,
      "date": Date.now(),
      "remark": req.body.description,
      "relatedAccounting": "6423fc9554015805ecc45913", //sales package recieveable credit
      "type": "Credit"
    })
    const fTransResult = await fTransaction.save()
    const secTransaction = new Transaction(
      {
        "amount": req.body.repaymentAmount,
        "date": Date.now(),
        "remark": req.body.description,
        "relatedBank": req.body.relatedBank,
        "relatedCash":req.body.relatedCash,
        "type": "Debit",
        "relatedTransaction": fTransResult._id
      }
    )
    const secTransResult = await secTransaction.save();

    const newBody = data;
    const newRepayment = new Repayment(newBody);
    const result = await newRepayment.save();

    //update PatientTreament's leftover amount
    
    const patientTreatmentResults = await PatientTreatment.findOneAndUpdate(
        { _id: data.relatedPateintTreatment },
        {leftOverAmount:data.remaningCredit},
        { new: true },
      )

    res.status(200).send({
      message: 'Repayment create success',
      success: true,
      data: result,
      patientTreatment: patientTreatmentResults,
      fTrans:fTransResult,
      sTrans:secTransResult
    });
  } catch (error) {
    console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateRepayment = async (req, res, next) => {
  try {
    const result = await Repayment.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedPateintTreatment');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteRepayment = async (req, res, next) => {
  try {
    const result = await Repayment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateRepayment = async (req, res, next) => {
  try {
    const result = await Repayment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
