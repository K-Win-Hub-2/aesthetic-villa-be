"use strict";
const MemberLevel = require("../models/memberLevel");

exports.listAllMemberLevel = async (req, res) => {
  try {
    let result = await MemberLevel.find({ isDeleted: false });
    let count = await MemberLevel.find({ isDeleted: false }).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result,
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: "No Record Found!" });
  }
};

exports.getMemberLevel = async (req, res) => {
  const result = await MemberLevel.find({
    _id: req.params.id,
    isDeleted: false,
  });
  if (!result)
    return res.status(500).json({ error: true, message: "No Record Found" });
  return res.status(200).send({ success: true, data: result });
};

exports.createMemberLevel = async (req, res, next) => {
  try {
    const newMemberLevel = new MemberLevel(req.body);
    const result = await newMemberLevel.save();
    res.status(200).send({
      message: "MemberLevel create success",
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.updateMemberLevel = async (req, res, next) => {
  try {
    const result = await MemberLevel.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true }
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.deleteMemberLevel = async (req, res, next) => {
  try {
    const result = await MemberLevel.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.activateMemberLevel = async (req, res, next) => {
  try {
    const result = await MemberLevel.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true }
    );
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};
