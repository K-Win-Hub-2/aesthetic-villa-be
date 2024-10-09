'use strict';
const procedureMedicine = require('../models/procedureMedicine');
const MedicineProcedure = require('../models/procedureMedicine');

exports.listAllMedicineProcedure = async (req, res) => {
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
    let result = await MedicineProcedure.find(query).populate('relatedCategory relatedBrand relatedSubCategory');
    console.log(result)
    count = await MedicineProcedure.find(query).count();
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
    console.log(e)
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getMedicineProcedure = async (req, res) => {
  const result = await MedicineProcedure.find({ _id: req.params.id,isDeleted:false }).populate('relatedCategory relatedBrand relatedSubCategory');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createMedicineProcedure = async (req, res, next) => {
  try {
    const newMedicineProcedure = new MedicineProcedure(req.body);
    const result = await newMedicineProcedure.save();
    res.status(200).send({
      message: 'MedicineProcedure create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateMedicineProcedure = async (req, res, next) => {
  try {
    const result = await MedicineProcedure.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedCategory relatedBrand relatedSubCategory');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteMedicineProcedure = async (req, res, next) => {
  try {
    const result = await MedicineProcedure.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateMedicineProcedure = async (req, res, next) => {
  try {
    const result = await MedicineProcedure.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.searchProcedureMedicine = async (req, res, next) => {
  try {
    const result = await procedureMedicine.find({ $text: { $search: req.body.search } }).populate('relatedCategory relatedBrand relatedSubCategory');
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

