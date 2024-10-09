'use strict';
const Log = require('../models/log');
const ProcedureItem = require('../models/procedureItem');
const AccessoryItem = require('../models/accessoryItem');
const MedicineItem = require('../models/medicineItem')
const Machine = require('../models/fixedAsset');
const Usage = require('../models/usage');
const UsageRecords = require('../models/usageRecord');
const Appointment = require('../models/appointment');

exports.listAllLog = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMedicineItems relatedMachine').populate({
      path: 'relatedTreatmentSelection',
      populate: [{
        path: 'relatedTreatment',
        model: 'Treatments'
      }]
    });
    let count = await Log.find({ isDeleted: false }).count();
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getRelatedUsage = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('relatedTreatmentSelection relatedMedicineItems relatedAppointment');
    let count = await Log.find({ isDeleted: false }).count();
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.filterLogs = async (req, res, next) => {
  try {
    let query = { isDeleted: false }
    const { start, end, id } = req.query
    console.log(start, end)
    if (start && end) query.date = { $gte: start, $lte: end }
    if (id) {
      query.$or = []
      query.$or.push(...[{ relatedProcedureItems: id }, { relatedAccessoryItems: id }, { relatedMachine: id }])
    }
    console.log(query)
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Log.find(query).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMedicineItems relatedMachine');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.createUsage = async (req, res) => {
  let { relatedTreatmentSelection, relatedAppointment, procedureMedicine, procedureAccessory, machine } = req.body;
  let machineError = []
  let procedureItemsError = []
  let accessoryItemsError = []
  let machineFinished = []
  let procedureItemsFinished = []
  let accessoryItemsFinished = []
  let createdBy = req.credentials.id
  try {
    const appResult = await Appointment.find({ _id: req.body.relatedAppointment })
    let status;
    if (appResult[0].relatedUsage === undefined) {
      console.log('here')
      if (procedureMedicine !== undefined) {
        for (const e of procedureMedicine) {
          if (e.stock < e.actual) {
            procedureItemsError.push(e);
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual;
            const result = await ProcedureItem.find({ _id: e.item_id });
            const from = result[0].fromUnit;
            const to = result[0].toUnit;
            const currentQty = (from * totalUnit) / to;
            console.log(currentQty, result[0].currentQuantity)
            const resultUpdate = await ProcedureItem.findOneAndUpdate(
              { _id: e.item_id },
              { totalUnit: totalUnit, currentQuantity: currentQty },
              { new: true }
            );
            console.log(resultUpdate)
            procedureItemsFinished.push(e);
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedProcedureItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "createdBy": createdBy
            });
          }
        }
      }
      //procedureAccessory

      if (procedureAccessory !== undefined) {
        for (const e of procedureAccessory) {
          if (e.stock < e.actual) {
            accessoryItemsError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await AccessoryItem.find({ _id: e.item_id })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            accessoryItemsFinished.push(e)
            const resultJpdate = await AccessoryItem.findOneAndUpdate(
              { _id: e.item_id },
              { totalUnit: totalUnit, currentQuantity: currentQty },
              { new: true },
            )
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedAccessoryItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",

              "createdBy": createdBy
            })
          }
        }
      }

      //machine

      if (machine !== undefined) {
        for (const e of machine) {
          if (e.stock < e.actual) {
            machineError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await Machine.find({ _id: e.item_id })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            machineFinished.push(e)
            const resultUpdate = await Machine.findOneAndUpdate(
              { _id: e.item_id },
              { totalUnit: totalUnit, currentQuantity: currentQty },
              { new: true },
            )
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedMachine": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",

              "createdBy": createdBy
            })
          }
        }
      }
      //usage create
      if (machineError.length > 0 || procedureItemsError.length > 0 || accessoryItemsError.length > 0) status = 'In Progress'
      if (machineError.length === 0 && procedureItemsError.length === 0 && accessoryItemsError.length === 0) status = 'Finished'
      req.body = { ...req.body, machineError: machineError, usageStatus: status, procedureItemsError: procedureItemsError, accessoryItemsError: accessoryItemsError, procedureAccessory: accessoryItemsFinished, procedureMedicine: procedureItemsFinished, machine: machineFinished }
      var usageResult = await Usage.create(req.body);
      var appointmentUpdate = await Appointment.findOneAndUpdate(
        { _id: req.body.relatedAppointment },
        { usageStatus: status, relatedUsage: usageResult._id },
        { new: true }
      )
      var usageRecordResult = await UsageRecords.create({
        relatedUsage: usageResult._id,
        usageStatus: status,
        procedureMedicine: procedureItemsFinished,
        procedureAccessory: accessoryItemsFinished,
        machine: machineFinished,
        machineError: machineError,
        procedureItemsError: procedureItemsError,
        accessoryItemsError: accessoryItemsError
      })
    }
    else {
      var usageRecordResult = await UsageRecords.find({ relatedUsage: appResult[0].relatedUsage }, { sort: { createdAt: -1 } })
      if (usageRecordResult.length > 0) {
        var URResult = await UsageRecords.find({ _id: usageRecordResult[0]._id })
      }
      const newMachine = req.body.machine.filter(value => {
        const match = URResult[0].machineError.some(errorItem => errorItem.item_id.toString() === value.item_id);
        return match;
      });

      const newPA = req.body.procedureAccessory.filter(value => {
        const match = URResult[0].accessoryItemsError.some(errorItem => errorItem.item_id.toString() === value.item_id);
        return match;
      });

      const newPM = req.body.procedureMedicine.filter(value => {
        const match = URResult[0].procedureItemsError.some(errorItem => errorItem.item_id.toString() === value.item_id);
        return match;
      });
      console.log('here', newPM.length)
      if (newPM.length > 0) {

        for (const e of newPM) {
          if (e.stock < e.actual) {
            procedureItemsError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await ProcedureItem.find({ _id: e.item_id })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            console.log(currentQty, result[0].currentQuantity)
            procedureItemsFinished.push(e)
            const resultUpdate = await ProcedureItem.findOneAndUpdate(
              { _id: e.item_id },
              { totalUnit: totalUnit, currentQuantity: currentQty },
              { new: true },
            )
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedProcedureItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "createdBy": createdBy
            })
          }
        }
      }

      //procedureAccessory

      if (newPA !== undefined) {
        for (const e of newPA) {
          if (e.stock < e.actual) {
            accessoryItemsError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await AccessoryItem.find({ _id: e.item_id })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            accessoryItemsFinished.push(e)
            const resultUpdate = await AccessoryItem.findOneAndUpdate(
              { _id: e.item_id },
              { totalUnit: totalUnit, currentQuantity: currentQty },
              { new: true },
            )
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedAccessoryItems": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",

              "createdBy": createdBy
            })
          }
        }
      }

      //machine

      if (newMachine !== undefined) {
        for (const e of newMachine) {
          if (e.stock < e.actual) {
            machineError.push(e)
          } else if (e.stock > e.actual) {
            let totalUnit = e.stock - e.actual
            const result = await Machine.find({ _id: e.item_id })
            const from = result[0].fromUnit
            const to = result[0].toUnit
            const currentQty = (from * totalUnit) / to
            machineFinished.push(e)
            const resultUpdate = await Stock.findOneAndUpdate(
              { _id: e.item_id },
              { totalUnit: totalUnit, currentQuantity: currentQty },
              { new: true },
            )
            const logResult = await Log.create({
              "relatedTreatmentSelection": relatedTreatmentSelection,
              "relatedAppointment": relatedAppointment,
              "relatedMachine": e.item_id,
              "currentQty": e.stock,
              "actualQty": e.actual,
              "finalQty": totalUnit,
              "type": "Usage",
              "createdBy": createdBy
            })
          }
        }
      }
      req.body = { ...req.body, machineError: machineError, procedureItemsError: procedureItemsError, accessoryItemsError: accessoryItemsError }
      if (machineError.length > 0 || procedureItemsError.length > 0 || accessoryItemsError.length > 0) status = 'In Progress'
      if (machineError.length === 0 && procedureItemsError.length === 0 && accessoryItemsError.length === 0) status = 'Finished'
      var usageUpdate = await Usage.findOneAndUpdate(
        { _id: appResult[0].relatedUsage },
        {
          $push: {
            procedureAccessory: { $each: accessoryItemsFinished },
            procedureMedicine: { $each: procedureItemsFinished },
            machine: { $each: machineFinished }
          },
          procedureItemsError: procedureItemsError,
          accessoryItemsError: accessoryItemsError,
          machineError: machineError,
          usageStatus: status,
        },
        { new: true }
      );
      var usageRecordResult = await UsageRecords.create({
        relatedUsage: usageUpdate._id,
        usageStatus: status,
        procedureMedicine: procedureItemsFinished,
        procedureAccessory: accessoryItemsFinished,
        machine: machineFinished,
        machineError: machineError,
        procedureItemsError: procedureItemsError,
        accessoryItemsError: accessoryItemsError
      })
    }
    //error handling
    let response = { success: true }
    if (machineError.length > 0) response.machineError = machineError
    if (procedureItemsError.length > 0) response.procedureItemsError = procedureItemsError
    if (accessoryItemsError.length > 0) response.accessoryItemsError = accessoryItemsError
    if (usageResult !== undefined) response.usageResult = usageResult
    if (usageRecordResult !== undefined) response.usageRecordResult = usageRecordResult
    if (appointmentUpdate !== undefined) response.appointmentUpdate = appointmentUpdate
    if (URResult !== undefined) response.URResult = URResult
    if (usageUpdate !== undefined) response.usageUpdate = usageUpdate

    return res.status(200).send(response)
  } catch (error) {
    // console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.getUsageRecordsByUsageID = async (req, res) => {
  try {
    let query = { isDeleted: false };
    if (req.params.id) query.relatedUsage = req.params.id
    const result = await UsageRecords.find(query).populate('relatedUsage procedureMedicine.item_id procedureAccessory.item_id machine.item_id machineError.item_id procedureItemsError.item_id accessoryItemsError.item_id')
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.getStockTotalUnit = async (req, res) => {
  try {
    let accessoryResults = [];
    let data = req.body;
    if (data.procedureItems) var procedureItems = await ProcedureItem.find({ _id: { $in: data.procedureItems }, })
    if (data.medicineItems) var medicineItems = await MedicineItem.find({ _id: { $in: data.medicineItems } })
    if (data.accessoryItems) accessoryResults = await AccessoryItem.find({ _id: { $in: data.accessoryItems } })
    if (data.machine) var machine = await Machine.find({ _id: { $in: data.machine } })
    return res.status(200).send({
      success: true,
      procedureItems: procedureItems,
      medicineItems: medicineItems,
      accessoryItems: accessoryResults,
      machine: machine
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.getUsage = async (req, res) => {
  try {
    const result = await Usage.find({ _id: req.params.id }).populate('procedureMedicine.item_id procedureAccessory.item_id machine.item_id machineError.item_id procedureItemsError.item_id accessoryItemsError.item_id')
    if (result.length <= 0) return res.status(404).send({ error: true, message: 'Not Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ success: true, message: error.message })
  }
}