'use strict';
const ProcedureHistory = require('../models/procedureHistory');
const Attachment = require('../models/attachment');
const procedureHistory = require('../models/procedureHistory');
const MedicineItems = require('../models/medicineItem');

exports.listAllProcedureHistorys = async (req, res) => {
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
    let result = await ProcedureHistory.find(query).populate('medicineItems.item_id customTreatmentPackages.item_id before after relatedAppointment relatedTreatmentSelection')
    count = await ProcedureHistory.find(query).count();
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

exports.getProcedureHistory = async (req, res) => {
  const result = await ProcedureHistory.find({ _id: req.params.id, isDeleted: false }).populate('medicineItems.item_id customTreatmentPackages.item_id before after relatedAppointment relatedTreatmentSelection')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedProcedureHistory = async (req, res) => {
  let { relatedAppointment, relatedTreatmentSelection } = req.query
  const result = await ProcedureHistory.find({ relatedTreatmentSelection: relatedTreatmentSelection, relatedAppointment: relatedAppointment, isDeleted: false }).populate('medicineItems.item_id customTreatmentPackages.item_id before after relatedAppointment relatedTreatmentSelection')
  if (result.length === 0)
    return res.status(404).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.uploadImage = async (req, res) => {
  let data = req.body
  let files = req.files
  try {
    if (files.phistory) {
      let imgPath = files.phistory[0].path.split('cherry-k')[1];
      const attachData = {
        fileName: files.phistory[0].originalname,
        imgUrl: imgPath,
        image: imgPath.split('\\')[2]
      };
      const newAttachment = new Attachment(attachData);
      const attachResult = await newAttachment.save();
    }
    const result = await ProcedureHistory.findOneAndUpdate(
      { _id: data.id },
      { pHistory: attachResult._id.toString() },
      { new: true },
    )
    return res.status(200).send({ success: true, data: result })
    //prepare img and save it into attachment schema
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: true, mesage: error.message })
  }
}

exports.createProcedureHistory = async (req, res, next) => {
  let data = req.body;
  data = { ...data, before: [], after: [] };
  let files = req.files;
  try {
    if (files.before) {
      for (const element of files.before) {
        let imgPath = element.path.split('cherry-k')[1];
        const attachData = {
          fileName: element.originalname,
          imgUrl: imgPath,
          image: imgPath.split('\\')[2]
        };
        const attachResult = await Attachment.create(attachData);
        console.log('attach', attachResult._id.toString());
        data.before.push(attachResult._id.toString());
      }
    }

    if (files.after) {
      for (const element of files.after) {
        let imgPath = element.path.split('cherry-k')[1];
        const attachData = {
          fileName: element.originalname,
          imgUrl: imgPath,
          image: imgPath.split('\\')[2]
        };
        const attachResult = await Attachment.create(attachData);
        console.log('attach', attachResult._id.toString());
        data.after.push(attachResult._id.toString());
      }
    }
    console.log(data)
    const result = await procedureHistory.create(data);
    const populate = await procedureHistory.find({ _id: result._id }).populate('medicineItems.item_id customTreatmentPackages.item_id before after relatedAppointment relatedTreatmentSelection')
    res.status(200).send({
      message: 'ProcedureHistory create success',
      success: true,
      data: populate
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ "error": true, message: error.message });
  }
};


exports.updateProcedureHistory = async (req, res, next) => {
  let data = req.body;

  let files = req.files;
  try {
    if (files.before) {
      data = { ...data, before: [] };
      for (const element of files.before) {
        let imgPath = element.path.split('cherry-k')[1];
        const attachData = {
          fileName: element.originalname,
          imgUrl: imgPath,
          image: imgPath.split('\\')[2]
        };
        const attachResult = await Attachment.create(attachData);
        console.log('attach', attachResult._id.toString());
        data.before.push(attachResult._id.toString());
      }
    }
    console.log(data)
    if (files.after) {
      data = { ...data, after: [] };
      for (const element of files.after) {
        let imgPath = element.path.split('cherry-k')[1];
        const attachData = {
          fileName: element.originalname,
          imgUrl: imgPath,
          image: imgPath.split('\\')[2]
        };
        const attachResult = await Attachment.create(attachData);
        console.log('attach', attachResult._id.toString());
        data.after.push(attachResult._id.toString());
      }
    }
    console.log(data, 'heree')
    const result = await procedureHistory.findOneAndUpdate({ _id: req.body._id }, data, { new: true }).populate('medicineItems.item_id customTreatmentPackages.item_id relatedAppointment relatedTreatmentSelection before after')
    res.status(200).send({
      message: 'ProcedureHistory update success',
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ "error": true, message: error.message });
  }
}

exports.deleteProcedureHistory = async (req, res, next) => {
  try {
    const result = await ProcedureHistory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateProcedureHistory = async (req, res, next) => {
  try {
    const result = await ProcedureHistory.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
