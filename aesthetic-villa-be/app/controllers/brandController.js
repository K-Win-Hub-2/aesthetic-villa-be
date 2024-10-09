'use strict';
const Brand = require('../models/brand');

exports.listAllBrands = async (req, res) => {
  try {
    let result = await Brand.find({isDeleted:false}).populate('category','name').populate('subCategory','name');
    let count = await Brand.find({isDeleted:false}).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error:true, message:'No Record Found!'});
  }
};

exports.getBrand = async (req, res) => {
  const result = await Brand.find({ _id: req.params.id,isDeleted:false }).populate('category').populate('subCategory');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createBrand = async (req, res, next) => {
  try {
    const newBrand = new Brand(req.body);
    const result = await newBrand.save();
    res.status(200).send({
      message: 'Brand create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateBrand = async (req, res, next) => {
  try {
    const result = await Brand.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteBrand = async (req, res, next) => {
  try {
    const result = await Brand.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateBrand = async (req, res, next) => {
  try {
    const result = await Brand.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterBrands = async (req, res, next) => {
  try {
    let query = {}
    const { name,code } = req.query
    if (name) query.name = name
    if (code) query.code = code
    if (Object.keys(query).length === 0) return res.status(404).send({error:true, message: 'Please Specify A Query To Use This Function'})
    const result = await Brand.find(query)
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchBrands = async (req, res, next) => {
  try {
    console.log(req.body.search)
    const result = await Brand.find({ $text: { $search: req.query.search } })
    if (result.length===0) return res.status(404).send({error:true, message:'No Record Found!'})
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}