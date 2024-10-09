'use strict';
const History = require('../models/history');
const Attachment = require('../models/attachment');

exports.listAllHistories = async (req, res) => {
  try {

    let result = await History.find({ isDeleted: false }).populate('relatedPatient consent')
    let count = await History.find({ isDeleted: false }).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getHistory = async (req, res) => {
  const result = await History.find({ _id: req.params.id, isDeleted: false }).populate('relatedPatient consent')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createHistory = async (req, res, next) => {
  try {
    let files = req.files;
    let data = req.body;
    console.log(req.body)
    if (files.consent) {
      for (const element of files.consent) {
        let imgPath = element.path.split('cherry-k')[1];
        const attachData = {
          fileName: element.originalname,
          imgUrl: imgPath,
          image: imgPath.split('\\')[2]
        };
        const attachResult = await Attachment.create(attachData);
        data = { ...data, consent: attachResult._id.toString() }
      }
    }
    // data = { ...data, skinCareAndCosmetic: JSON.parse(req.body.skinCareAndCosmetic) }
    // console.log(data)
    if (data.skinCareAndCosmetic) data = { ...data, skinCareAndCosmetic: JSON.parse(req.body.skinCareAndCosmetic) }
    const result = await History.create(data);
    const populate = await History.find({ _id: result._id }).populate('consent')
    res.status(200).send({
      message: 'History create success',
      success: true,
      data: populate
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateHistory = async (req, res, next) => {
  try {
    let files = req.files;
    let data = req.body;
    console.log(req.body)
    if (files.consent) {
      for (const element of files.consent) {
        let imgPath = element.path.split('cherry-k')[1];
        const attachData = {
          fileName: element.originalname,
          imgUrl: imgPath,
          image: imgPath.split('\\')[2]
        };
        const attachResult = await Attachment.create(attachData);
        data = { ...data, consent: attachResult._id.toString() }
      }
    }
    // data = { ...data, skinCareAndCosmetic: JSON.parse(req.body.skinCareAndCosmetic) }
    // console.log(data)
    if (data.skinCareAndCosmetic) data = { ...data, skinCareAndCosmetic: JSON.parse(req.body.skinCareAndCosmetic) }
    const result = await History.findOneAndUpdate(
      { _id: data.id },
      data,
      { new: true },
    ).populate('relatedPatient consent')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteHistory = async (req, res, next) => {
  try {
    const result = await History.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateHistory = async (req, res, next) => {
  try {
    const result = await History.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterHistories = async (req, res, next) => {
  try {
    let query = {}
    const { name, code } = req.query
    if (name) query.name = name
    if (code) query.code = code
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await History.find(query).populate('relatedPatient')
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchHistories = async (req, res, next) => {
  try {
    const result = await History.find({ $text: { $search: req.query.search } }).populate('relatedPatient')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}