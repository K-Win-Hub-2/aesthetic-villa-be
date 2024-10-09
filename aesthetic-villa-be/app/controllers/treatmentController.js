'use strict';
const Treatment = require('../models/treatment');
const Accounting = require('../models/accountingList');

exports.listAllTreatments = async (req, res) => {
  let { keyword, role, limit, skip, per_page, current_page } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = per_page ? per_page : 0 ; //limit
    skip = current_page ? ( current_page - 1 ) * per_page : 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';

    let result = await Treatment.find(query).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('machine.item_id').populate('procedureAccessory.item_id').populate('medicineLists.item_id').populate('procedureMedicine.item_id').populate('treatmentName')
                                .skip(skip)
                                .limit(limit)
    
    count = await Treatment.find(query).count();
    const division = count / limit;
    page = Math.ceil(division);

    res.status(200).send({
      success: true,
      count: count,
      _metadata: {
        current_page: current_page,
        per_page: per_page || count,
        page_count: count / ( per_page || count),
        total_count: count,
      },
      list: result,
    });
  } catch (e) {
    console.log(e)
    //return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getTreatment = async (req, res) => {
  const result = await Treatment.findOne({ _id: req.params.id, isDeleted: false }).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('machine.item_id').populate('procedureAccessory.item_id').populate('medicineLists.item_id').populate('procedureMedicine.item_id').populate('treatmentName')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTreatment = async (req, res, next) => {
  let { name } = req.body;
  let data = req.body
  try {
    // const accResult = await Accounting.create({
    //   name: name + 'income',
    //   subHeader: name + 'income',
    //   relatedType: "6467310959a9bc811d97e9c9", //Profit and Loss
    //   relatedHeader: "646731e059a9bc811d97eab9",//Revenue
    // })
    // data = { ...data, relatedAccount: accResult._id } //putting it back into treatment.js
    const result = await Treatment.create(data);

    res.status(200).send({
      message: 'Treatment create success',
      success: true,
      // accResult: accResult,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTreatment = async (req, res, next) => {
  try {
    const result = await Treatment.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('').populate('machine.item_id').populate('procedureAccessory.item_id').populate('medicineLists.item_id').populate('procedureMedicine.item_id').populate('treatmentName')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTreatment = async (req, res, next) => {
  try {
    const result = await Treatment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateTreatment = async (req, res, next) => {
  try {
    const result = await Treatment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.searchTreatments = async (req, res, next) => {
  try {
    const result = await Treatment.find({ $text: { $search: req.body.search } }).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('').populate('machine.item_id').populate('procedureAccessory.item_id').populate('medicineLists.item_id').populate('procedureMedicine.item_id').populate('treatmentName')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.getRelatedTreatmentByTreatmentListID = async (req, res) => {
  try {
    const result = await Treatment.find({ treatmentName: req.params.id }).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('').populate('machine.item_id').populate('procedureAccessory.item_id').populate('medicineLists.item_id').populate('procedureMedicine.item_id').populate('treatmentName')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}
