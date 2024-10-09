'use strict';
const SubCategory = require('../models/subCategory');

exports.listAllSubCategories = async (req, res) => {
  try {
    let result = await SubCategory.find({isDeleted:false}).populate('relatedCategory','name');
    let count = await SubCategory.find({isDeleted:false}).count();
    console.log(result)
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error:true, message:'No Record Found!'});
  }
};

exports.getSubCategory = async (req, res) => {
  const result = await SubCategory.find({ _id: req.params.id,isDeleted:false }).populate('relatedCategory','name');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createSubCategory = async (req, res, next) => {
  try {
    const newSubCategory = new SubCategory(req.body);
    const result = await newSubCategory.save();
    res.status(200).send({
      message: 'SubCategory create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateSubCategory = async (req, res, next) => {
  try {
    const result = await SubCategory.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteSubCategory = async (req, res, next) => {
  try {
    const result = await SubCategory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateSubCategory = async (req, res, next) => {
  try {
    const result = await SubCategory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
