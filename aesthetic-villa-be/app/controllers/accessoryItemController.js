'use strict';
const AccessoryItem = require('../models/accessoryItem');
const Log = require('../models/log');

exports.listAllAccessoryItems = async (req, res) => {
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
    let result = await AccessoryItem.find(query).populate('name')
    count = await AccessoryItem.find(query).count();
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

exports.getAccessoryItem = async (req, res) => {
  const result = await AccessoryItem.find({ _id: req.params.id, isDeleted: false }).populate('name')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedAccessoryItem = async (req, res) => {
  const result = await AccessoryItem.find({ name: req.params.id, isDeleted: false }).populate('name')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createAccessoryItem = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newAccessoryItem = new AccessoryItem(newBody);
    const result = await newAccessoryItem.save();
    res.status(200).send({
      message: 'AccessoryItem create success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateAccessoryItem = async (req, res, next) => {
  try {
    const getResult = await AccessoryItem.find({ _id: req.body.id })
    const result = await AccessoryItem.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('name')
    const logResult = await Log.create({
      "relatedAccessoryItems": req.body.id,
      "currentQty": getResult[0].totalUnit,
      "finalQty": req.body.totalUnit,
      "type": "Stock Update",
      "createdBy": req.credentials.id
    })
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteAccessoryItem = async (req, res, next) => {
  try {
    const result = await AccessoryItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateAccessoryItem = async (req, res, next) => {
  try {
    const result = await AccessoryItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.searchAccessoryItems = async (req, res, next) => {
  try {
    const result = await AccessoryItem.find({ $text: { $search: req.body.search } }).populate('name')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
