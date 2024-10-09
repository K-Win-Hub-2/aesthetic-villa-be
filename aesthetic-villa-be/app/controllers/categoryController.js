'use strict';
const Category = require('../models/category');

exports.listAllCategories = async (req, res) => {
  try {
    let result = await Category.find({isDeleted:false});
    let count = await Category.find({isDeleted:false}).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error:true, message:'No Record Found!'});
  }
};

exports.getCategory = async (req, res) => {
  const result = await Category.find({ _id: req.params.id,isDeleted:false });
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createCategory = async (req, res, next) => {
  try {
    const newCategory = new Category(req.body);
    const result = await newCategory.save();
    res.status(200).send({
      message: 'Category create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const result = await Category.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const result = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateCategory = async (req, res, next) => {
  try {
    const result = await Category.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
