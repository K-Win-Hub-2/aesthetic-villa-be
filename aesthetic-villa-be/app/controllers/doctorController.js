'use strict';
const Doctor = require('../models/doctor');

exports.listAllDoctors = async (req, res) => {
  try {
    let result = await Doctor.find({isDeleted:false}).select("-code");
    let count = await Doctor.find({isDeleted:false}).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error:true, message:'No Record Found!'});
  }
};

exports.getDoctor = async (req, res) => {
  const result = await Doctor.find({ _id: req.params.id,isDeleted:false }).select("-code");
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createDoctor = async (req, res, next) => {
  try {
    const newDoctor = new Doctor(req.body);
    const result = await newDoctor.save();
    res.status(200).send({
      message: 'Doctor create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const result = await Doctor.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const result = await Doctor.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateDoctor = async (req, res, next) => {
  try {
    const result = await Doctor.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
