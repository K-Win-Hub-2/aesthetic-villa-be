'use strict';
const PhysicalExamination = require('../models/physicalExamination');

exports.listAllPhysicalExaminations = async (req, res) => {
  try {
    let result = await PhysicalExamination.find({isDeleted:false}).populate('relatedPatient')
    let count = await PhysicalExamination.find({isDeleted:false}).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error:true, message:'No Record Found!'});
  }
};

exports.getPhysicalExamination = async (req, res) => {
  const result = await PhysicalExamination.find({ _id: req.params.id,isDeleted:false }).populate('relatedPatient')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createPhysicalExamination = async (req, res, next) => {
  try {
    const newPhysicalExamination = new PhysicalExamination(req.body);
    const result = await newPhysicalExamination.save();
    res.status(200).send({
      message: 'PhysicalExamination create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updatePhysicalExamination = async (req, res, next) => {
  try {
    const result = await PhysicalExamination.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedPatient')
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deletePhysicalExamination = async (req, res, next) => {
  try {
    const result = await PhysicalExamination.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activatePhysicalExamination = async (req, res, next) => {
  try {
    const result = await PhysicalExamination.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterPhysicalExaminations = async (req, res, next) => {
  try {
    let query = {}
    const { name,code } = req.query
    if (name) query.name = name
    if (code) query.code = code
    if (Object.keys(query).length === 0) return res.status(404).send({error:true, message: 'Please Specify A Query To Use This Function'})
    const result = await PhysicalExamination.find(query).populate('relatedPatient')
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchPhysicalExaminations = async (req, res, next) => {
  try {
    console.log(req.body.search)
    const result = await PhysicalExamination.find({ $text: { $search: req.query.search } }).populate('relatedPatient')
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}