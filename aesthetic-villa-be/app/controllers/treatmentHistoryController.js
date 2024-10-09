'use strict';
const TreatmentHistory = require('../models/treatmentHistory');
const Attachment = require('../models/attachment');

exports.listAllTreatmentHistorys = async (req, res) => {
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
    console.log(limit)
    let result = await TreatmentHistory.find(query).populate('attachments').populate('relatedAppointment');
    count = await TreatmentHistory.find(query).count();
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

exports.getTreatmentHistory = async (req, res) => {
  const result = await TreatmentHistory.find({ _id: req.params.id,isDeleted:false }).populate('attachments').populate('relatedAppointment');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTreatmentHistory = async (req, res, next) => {
  let data = req.body;
  let files = req.files;
  console.log(data,files)
  try {
    if (files.history !== undefined) {
      let arr = [];
      let preparation = [];
      files.history.map(async (file) => {
        const attachData = { fileName: file.originalname, imgUrl: file.path };
        arr.push(attachData);
      });
      const attachResults = await Attachment.insertMany(arr);
      attachResults.map(async (i) => {
        preparation.push(i._id);
      });
      data = { ...data, attachments: preparation };
      console.log(data)
    } //prepare img and save it into attachment schema\

    const newTreatmentHistory = new TreatmentHistory(data);
    const result = await newTreatmentHistory.save();
    res.status(200).send({
      message: 'TreatmentHistory create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error)
    //return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTreatmentHistory = async (req, res, next) => {
  let data = req.body;
  let files = req.files;
  try {
    if (files.history !== undefined) {
      let arr = [];
      let preparation = [];
      files.history.map(async (file) => {
        const attachData = { fileName: file.originalname, imgUrl: file.path };
        arr.push(attachData);
      });
      const attachResults = await Attachment.insertMany(arr);
      attachResults.map(async (i) => {
        preparation.push(i._id);
      });
      data = { ...data, attachments: preparation };
      console.log(data)
    } //prepare img and save it into attachment schema\

    const result = await TreatmentHistory.findOneAndUpdate(
      { _id: req.body.id },
      {$set: data},
      { new: true },
    ).populate('attachments').populate('relatedAppointment');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTreatmentHistory = async (req, res, next) => {
  try {
    const result = await TreatmentHistory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateTreatmentHistory = async (req, res, next) => {
  try {
    const result = await TreatmentHistory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
