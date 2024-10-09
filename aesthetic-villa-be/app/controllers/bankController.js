'use strict';
const Bank = require('../models/bank');
const AccountingList = require('../models/accountingList');

exports.listAllBanks = async (req, res) => {
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
    let result = await Bank.find(query).populate('relatedAccounting');
    count = await Bank.find(query).count();
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

exports.getBank = async (req, res) => {
  const result = await Bank.find({ _id: req.params.id,isDeleted:false }).populate('relatedAccounting')
  if (result.length === 0)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createBank = async (req, res, next) => {
  let newBody = req.body;
  try {
    const bankAccJSON = {
      code:req.body.coaCode,
      relatedType:req.body.relatedType,
      relatedHeader:req.body.relatedHeader,
      subHeader:req.body.subHeading,
      name:req.body.accountName,
      relatedTreatment:null,
      amount:req.body.balance,
      openingBalance:req.body.balance,
      generalFlag:null,
      relatedCurrency:null,
      carryForWork:null,
    }
    const newBankAcc = new AccountingList(bankAccJSON)
    const bankAccResult = await newBankAcc.save();

    newBody = {...newBody,relatedAccounting:bankAccResult._id }
    const newBank = new Bank(newBody);
    const result = await newBank.save();
    res.status(200).send({
      message: 'Bank create success',
      success: true,
      data: result,
      bank:bankAccResult
    });
  } catch (error) {
    console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateBank = async (req, res, next) => {
  try {
    const result = await Bank.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccounting');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteBank = async (req, res, next) => {
  try {
    const result = await Bank.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateBank = async (req, res, next) => {
  try {
    const result = await Bank.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
