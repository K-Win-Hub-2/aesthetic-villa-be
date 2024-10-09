'use strict';
const ProcedureAccessory = require('../models/procedureAccessory')

exports.listAllProcedureAccessorys = async (req, res) => {
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
    let result = await ProcedureAccessory.find(query).populate('relatedCategory relatedBrand relatedSubCategory');
    count = await ProcedureAccessory.find(query).count();
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

exports.getProcedureAccessory = async (req, res) => {
  const result = await ProcedureAccessory.find({ _id: req.params.id,isDeleted:false }).populate('relatedCategory relatedBrand relatedSubCategory');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createProcedureAccessory = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newProcedureAccessory = new ProcedureAccessory(newBody);
    const result = await newProcedureAccessory.save();
    res.status(200).send({
      message: 'ProcedureAccessory create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateProcedureAccessory = async (req, res, next) => {
  try {
    const result = await ProcedureAccessory.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedCategory relatedBrand relatedSubCategory');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteProcedureAccessory = async (req, res, next) => {
  try {
    const result = await ProcedureAccessory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateProcedureAccessory = async (req, res, next) => {
  try {
    const result = await ProcedureAccessory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.searchProcedureAccessories = async (req, res, next) => {
  try {
    const result = await ProcedureAccessory.find({ $text: { $search: req.body.search } }).populate('relatedCategory relatedBrand relatedSubCategory');
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}