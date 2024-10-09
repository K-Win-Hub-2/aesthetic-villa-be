'use strict';
const Therapist = require('../models/therapist');
const Comission = require('../models/comission');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const ComissionPay = require('../models/commissionPay');
const { ObjectId } = require('mongodb');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList')

exports.listAllTherapists = async (req, res) => {
  try {
    let result = await Therapist.find({ isDeleted: false });
    let count = await Therapist.find({ isDeleted: false }).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getTherapist = async (req, res) => {
  const result = await Therapist.find({ _id: req.params.id, isDeleted: false });
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTherapist = async (req, res, next) => {
  try {
    const newTherapist = new Therapist(req.body);
    const result = await newTherapist.save();
    res.status(200).send({
      message: 'Therapist create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTherapist = async (req, res, next) => {
  try {
    const result = await Therapist.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTherapist = async (req, res, next) => {
  try {
    const result = await Therapist.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateTherapist = async (req, res, next) => {
  try {
    const result = await Therapist.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.createComission = async (req, res, next) => {
  let { comission } = req.body
  let appointmentResult = await Appointment.find({ _id: req.body.appointmentID })
  if (appointmentResult[0].isCommissioned === true) return res.status(500).send({ error: true, message: 'Alread Commissioned!' })
  let therapistUpdate = await Therapist.findOneAndUpdate(
    { _id: req.body.therapistID },
    { commissionAmount: comission }
  )
  let appointmentUpdate = await Appointment.findOneAndUpdate(
    { _id: req.body.appointmentID },
    { isCommissioned: true }
  )
  let newBody = req.body;
  try {
    const newComission = new Comission(newBody);
    const result = await Comission.create({
      relatedAppointment: req.body.appointmentID,
      appointmentAmount: req.body.totalAmount / req.body.treatmentTimes,
      commissionAmount: comission,
      relatedTherapist: req.body.therapistID
    }).then(async (response) => {
      const TransactionResult = await Transaction.create({
        "amount": comission,
        "date": Date.now(),
        "remark": req.body.remark,
        "type": "Credit",
        "relatedTransaction": null,
        "relatedAccounting": "64ae1d0012b3d31436d48027", //Sales Comission
      })
      const amountUpdate = await Accounting.findOneAndUpdate(
        { _id: '64ae1d0012b3d31436d48027' },
        { $inc: { amount: comission } }
      )
    })
    res.status(200).send({
      message: 'Comission create success',
      success: true,
      data: result,
      therapistResult: therapistUpdate
    });
  } catch (error) {
    // console.log(error )
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.searchCommission = async (req, res) => {
  let total = 0
  console.log('here')
  try {
    const { month, therapist } = req.query;
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    //Check if the provided month value is valid
    if (!months.includes(month)) {
      return res.status(400).json({ error: 'Invalid month' });
    }

    // Get the start and end dates for the specified month
    const startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month), 1));
    const endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month) + 1, 1));
    console.log(startDate, endDate)
    let query = { status: 'Unclaimed' }
    if (month) query.date = { $gte: startDate, $lte: endDate }
    if (therapist) query.relatedTherapist = therapist
    const result = await Comission.find(query).populate('relatedTherapist relatedAppointment')
    for (let i = 0; i < result.length; i++) {
      total = result[i].commissionAmount + total
    }

    return res.status(200).send({ success: true, data: result, collectAmount: total, startDate: startDate, endDate: endDate })
  } catch (e) {
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.collectComission = async (req, res) => {
  try {
    let { update, startDate, endDate, collectAmount, remark, relatedTherapist } = req.body
    // Convert string IDs to MongoDB ObjectIds
    const objectIds = update.map((id) => ObjectId(id));

    // Perform the update operation
    const updateResult = await Comission.updateMany(
      { _id: { $in: objectIds } }, // Use $in operator to match multiple IDs
      { status: 'Claimed' },
      { new: true }
    );
    const cPayResult = await ComissionPay.create({
      startDate: startDate,
      endDate: endDate,
      collectAmount: collectAmount,
      remark: remark,
      relatedTherapist: relatedTherapist,
      relatedCommissions: objectIds
    })
    return res.status(200).send({ success: true, updateResult: updateResult, comissionPayResult: cPayResult })
  } catch (e) {
    return res.status(500).send({ error: true, message: e.message });
  }
}