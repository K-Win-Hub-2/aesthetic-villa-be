'use strict';
const Appointment = require('../models/appointment');
const TreatmentSelection = require("../models/treatmentSelection");
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
var ObjectID = require("mongodb").ObjectID; //to check if the value is objectid or not
const Treatment = require('../models/treatment');

function formatDateAndTime(dateString) { // format mongodb ISO 8601 date format into two readable var {date, time}.
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // add 1 to zero-indexed month
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hour}:${minute}`;

  return [formattedDate, formattedTime];
}

exports.listAllAppointments = async (req, res) => {
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
    let result = await Appointment.find(query).populate('relatedPatient').populate('relatedDoctor').populate('relatedTherapist').populate('relatedTreatmentSelection').populate('relatedTreatmentSelection.relatedAppointments');
    console.log(result)
    count = await Appointment.find(query).count();
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

exports.getTodaysAppointment = async (req, res) => {
  try {
    var start = new Date();
    var end = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const result = await Appointment.find({ originalDate: { $gte: start, $lt: end } }).populate('relatedDoctor').populate('relatedTherapist').populate('relatedTreatmentSelection').populate({
      path: 'relatedPatient',
      populate: [{
        path: 'img',
        model: 'Attachments'
      }]
    }).populate({
      path: 'relatedTreatmentSelection',
      model: 'TreatmentSelections',
      populate: {
        path: 'relatedAppointments',
        model: 'Appointments',
        populate: {
          path: 'relatedDoctor',
          model: 'Doctors'
        }
      }
    })
    console.log(result)
    if (result.length === 0) return res.status(404).json({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.getAppointment = async (req, res) => {
  try {
    const result = await Appointment.find({ _id: req.params.id, isDeleted: false }).populate('relatedDoctor').populate('relatedTherapist').populate('relatedTreatmentSelection').populate({
      path: 'relatedPatient',
      populate: [{
        path: 'img',
        model: 'Attachments'
      }]
    }).populate({
      path: 'relatedTreatmentSelection',
      model: 'TreatmentSelections',
      populate: {
        path: 'relatedAppointments',
        model: 'Appointments',
        populate: {
          path: 'relatedDoctor',
          model: 'Doctors'
        }
      }
    })
    console.log(result)
    if (!result) return res.status(500).json({ error: true, message: 'No Record Found' });
    //const relateTreatment = await Treatment.find({ _id: result[0].relatedTreatmentSelection[0].relatedTreatment }).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('procedureMedicine').populate('relatedAppointment')
    //if (relateTreatment.length === 0) return res.status(500).json({ error: true, message: "There's no related treatment id in the database" })
    return res.status(200).send({ success: true, data: result, treatment: "relateTreatment" });
  } catch (error) {
    console.log(error)
    //return res.status(500).send({ error: true, message: error.message })
  }
};

exports.createAppointment = async (req, res, next) => {
  let data = req.body
  try {
    if (req.body.pstatus == 'New') {
      const latestDocument = await Patient.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
      console.log(latestDocument)
      if (latestDocument.length === 0) data = { ...data, seq: '1', patientID: "CUS-1" } // if seq is undefined set initial patientID and seq
      console.log(data)
      if (latestDocument.length) {
        const increment = latestDocument[0].seq + 1
        data = { ...data, patientID: "CUS-" + increment, seq: increment }
      }
      console.log(data)
      const newPatient = new Patient(data)
      var pResult = await newPatient.save();
      data = { ...data, relatedPatient: pResult._id }
    }
    // const dateAndTime = formatDateAndTime(req.body.originalDate)
    // const newBody = { ...req.body, date: dateAndTime[0], time: dateAndTime[1] }
    const newAppointment = new Appointment(data);
    const result = await newAppointment.save();
    res.status(200).send({
      message: 'Appointment create success',
      success: true,
      data: result,
      patientResult: pResult
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateAppointment = async (req, res, next) => { 
  
  try {
    let result
    let { relatedPatient, treatmentSelectId } = req.body;
    let treatmentSelectQuery = await TreatmentSelection.findById(treatmentSelectId);
    const queryAppointment = await Appointment.findById(req.body.id)
     if (relatedPatient && !queryAppointment.status) {
      result = await Appointment.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
      ).populate('relatedPatient').populate('relatedDoctor').populate('relatedTherapist relatedNurse');
      const patient = await Patient.findById(relatedPatient)
      const patientUpdate = await Patient.findOneAndUpdate(
        { _id: relatedPatient },
        { $inc: { unfinishedAppointments: -1, finishedAppointments: 1 }},
        { new: true} 
      )
    }
    
     let actualRevenue = treatmentSelectQuery.actualRevenue + treatmentSelectQuery.perAppointmentPrice;
     let deferRevenue = treatmentSelectQuery.deferRevenue - treatmentSelectQuery.perAppointmentPrice;
     console.log("Actual Revenue 1 " + actualRevenue) 
     if(deferRevenue >= 0){

     const treatmentUpdate = await TreatmentSelection.findByIdAndUpdate(
      treatmentSelectId,
      {
        actualRevenue : actualRevenue,
        deferRevenue : deferRevenue
      }
    )
     }

    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const result = await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateAppointment = async (req, res, next) => {
  try {
    const result = await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterAppointments = async (req, res, next) => {
  try {
    let query = { isDeleted: false }
    const { start, end, token, phone } = req.query
    console.log(start, end)
    if (start && end) query.originalDate = { $gte: start, $lte: end }
    if (token) query.token = token
    if (phone) query.phone = phone
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Appointment.find(query).populate('relatedPatient relatedDoctor relatedTherapist');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchAppointment = async (req, res, next) => {
  try {
    console.log(req.body.search)
    const result = await Appointment.find({ $text: { $search: req.body.search }, isDeleted: false })
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}
