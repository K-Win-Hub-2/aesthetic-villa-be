'use strict';
const TreatmentList = require('../models/treatmentList');
const Treatment = require('../models/treatment');

exports.listAllTreatmentLists = async (req, res) => {
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
    let result = await TreatmentList.find(query)
    console.log(result)
    count = await TreatmentList.find(query).count();
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

exports.getTreatmentList = async (req, res) => {
  const result = await TreatmentList.find({ _id: req.params.id, isDeleted: false })
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTreatments = async (req, res) => {
  // .populate('treatmentName relatedDoctor relatedTherapist procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id machine.item_id relatedPatient relatedAppointment')
  console.log(req.params.id)  
  const result = await Treatment.find({ treatmentName: req.params.id })
  if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found" });
  return res.status(200).send({ success: true, data: result });
}

exports.createTreatmentList = async (req, res, next) => {
  try {
    const newTreatmentList = new TreatmentList(req.body);
    const result = await newTreatmentList.save();
    res.status(200).send({
      message: 'TreatmentList create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTreatmentList = async (req, res, next) => {
  try {
    const result = await TreatmentList.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTreatmentList = async (req, res, next) => {
  try {
    const result = await TreatmentList.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateTreatmentList = async (req, res, next) => {
  try {
    const result = await TreatmentList.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterTreatmentLists = async (req, res, next) => {
  try {
    let query = {}
    const { name, code } = req.query
    if (name) query.name = name
    if (code) query.code = code
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await TreatmentList.find(query)
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchTreatmentLists = async (req, res, next) => {
  try {
    console.log(req.body.search)
    const result = await TreatmentList.find({ $text: { $search: req.query.search } })
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

