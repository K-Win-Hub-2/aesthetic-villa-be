'use strict';
const MedicineItem = require('../models/medicineItem')

exports.listAllMedicineItems = async (req, res) => {
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
    let result = await MedicineItem.find(query).populate('name')
    count = await MedicineItem.find(query).count();
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

exports.getMedicineItem = async (req, res) => {
  const result = await MedicineItem.find({ _id: req.params.id,isDeleted:false }).populate('name');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedMedicineItem = async (req, res) => {
  const result = await MedicineItem.find({ name: req.params.id,isDeleted:false }).populate('name');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};


exports.createMedicineItem = async (req, res, next) => {
  try {
    const newMedicineItem = new MedicineItem(req.body);
    const result = await newMedicineItem.save();
    res.status(200).send({
      message: 'MedicineItem create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateMedicineItem = async (req, res, next) => {
  try {
    const result = await MedicineItem.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('name')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteMedicineItem = async (req, res, next) => {
  try {
    const result = await MedicineItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateMedicineItem = async (req, res, next) => {
  try {
    const result = await MedicineItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterMedicineItems = async (req, res, next) => {
  try {
    let query = {}
    let { gender, startDate, endDate, status } = req.query
    if (gender) query.gender = gender
    if (status) query.patientStatus = status
    if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await MedicineItem.find(query).populate('name')
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchMedicineItems = async (req, res, next) => {
  try {
    const result = await MedicineItem.find({ $text: { $search: req.body.search } }).populate('name')
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
