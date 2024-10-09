'use strict';
const Patient = require('../models/patient');
const Attachment = require('../models/attachment');
const Physical = require('../models/physicalExamination');
const History = require('../models/history')
const UserUtil = require('../lib/userUtil');
const path = require('path');

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

exports.excelImportTreatmentVouchers = async (req, res) => {
  try {
    let files = req.files
    if (files.excel) {
      for (const i of files.excel) {
        const subpath = path.join('app', 'controllers');  // Construct the subpath using the platform's path separator
        const newPath = __dirname.replace(subpath, '');
        const dest = path.join(newPath, i.path)
        const data = await UserUtil.readExcelDataForTreatmentVoucher(dest)
        await TreatmentVoucher.insertMany(data).then((response) => {
          return res.status(200).send({
            success: true, data: response
          })
        })
          .catch(error => {
            return res.status(500).send({ error: true, message: error })
          })
      }
    }
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.excelImportPatient = async (req, res) => {
  try {
    console.log('here')
    let files = req.files
    if (files.excel) {
      const latestDocument = await Patient.find({}, { seq: 1 }).sort({ seq: -1 }).limit(1).exec();
      console.log(latestDocument)
      for (const i of files.excel) {
        const subpath = path.join('app', 'controllers');  // Construct the subpath using the platform's path separator
        const newPath = __dirname.replace(subpath, '');
        const dest = path.join(newPath, i.path)
        const data = await UserUtil.readExcelDataForPatient(dest, latestDocument[0].seq)
        console.log(data)
        await Patient.insertMany(data).then((response) => {
          return res.status(200).send({
            success: true, data: response
          })
        })
          .catch(error => {
            return res.status(500).send({ error: true, message: error })
          })
      }
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }

}

exports.getHistoryAndPhysicalExamination = async (req, res) => {
  const { id } = req.params;
  try {
    const PhysicalResult = await Physical.find({ relatedPatient: id, isDeleted: false }).populate('relatedPatient');
    const result = await History.find({ relatedPatient: id, isDeleted: false }).populate('relatedPatient consent')
    return res.status(200).send({ success: true, PhysicalResult: PhysicalResult, HistoryResult: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.listAllPatients = async (req, res) => {
  let { keyword, role, limit, skip, member } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 0; //limit
    skip = +skip || 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';
    if (member) query.relatedMember = member
    let result = await Patient.find(query).skip(skip * limit).limit(limit).populate('img');
    count = await Patient.find(query).count();
    const division = count / limit;
    page = Math.ceil(division);

    res.status(200).send({
      success: true,
      count: count,
      _metadata: {
        current_page: skip + 1,
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

exports.getPatient = async (req, res) => {
  let query = { isDeleted: false }
  if (req.params.id) query._id = req.params.id
  const result = await Patient.find(query).populate('img').populate({
    path: 'relatedMember',
    model: 'Members',
    populate: {
      path: 'relatedDiscount',
      model: 'Discounts'
    }
  }).populate({
    path: 'relatedTreatmentSelection',
    model: 'TreatmentSelections',
    populate: {
      path: 'relatedAppointments',
      model: 'Appointments',
      populate:[{
        path: 'relatedDoctor',
        model: 'Doctors'
      },
      {
        path: 'relatedTherapist',
        model: 'Therapists'
      },
    ]
    }
  }).populate({
    path: 'relatedTreatmentSelection',
    model: 'TreatmentSelections',
    populate: {
      path: 'relatedTreatment',
      model: 'Treatments'
    }
  }).populate({
    path: 'relatedPackageSelection',
    model: 'PackageSelections',
    populate: {
      path: 'relatedPackage',
      model: 'Packages',
      populate: {
        path: 'relatedTreatments',
        model: 'Treatments'
      }
    }
  });
  if (!result)
    return res.status(500).json({ error: true, message: 'Query Failed!' });
  if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
  return res.status(200).send({ success: true, data: result[0] });
};

function getInitialsInUpperCase(inputString) {
  const words = inputString.split(' ');
  const initials = words.map(word => word.charAt(0).toUpperCase());
  return initials.join('');
}

exports.createPatient = async (req, res, next) => {
  let data = req.body;
  let files = req.files;
  try {
    //prepare CUS-ID
    const latestDocument = await Patient.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
    console.log(latestDocument)
    const initials = getInitialsInUpperCase(data.name)
    if (latestDocument.length === 0) {

      data = { ...data, seq: '1', patientID: "CUS-" + initials + "-1" }
    } // if seq is undefined set initial patientID and seq
    console.log(data)
    if (latestDocument.length) {
      const increment = latestDocument[0].seq + 1
      data = { ...data, patientID: "CUS-" + initials + "-" + increment, seq: increment }
    }
    console.log(files.img, 'files.img')
    if (files.img) {
      let imgPath = files.img[0].path.split('cherry-k')[1];
      const attachData = {
        fileName: files.img[0].originalname,
        imgUrl: imgPath,
        image: imgPath.split('\\')[2]
      };
      const newAttachment = new Attachment(attachData);
      const attachResult = await newAttachment.save();
      data = { ...data, img: attachResult._id.toString() };
    } //prepare img and save it into attachment schema

    const newPatient = new Patient(data);
    const result = await newPatient.save();
    res.status(200).send({
      message: 'Patient create success',
      success: true,
      data: result
    });
  } catch (error) {
    //console.log(error)
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updatePatient = async (req, res, next) => {
  let data = req.body;
  let files = req.files;
  try {
    if (files.img) {
      console.log(files.img, 'files.img')
      let imgPath = files.img[0].path.split('cherry-k')[1];
      const attachData = {
        fileName: files.img[0].originalname,
        imgUrl: imgPath,
        image: imgPath.split('\\')[2]
      };
      const newAttachment = new Attachment(attachData);
      const attachResult = await newAttachment.save();
      data = { ...data, img: attachResult._id.toString() };
    } //prepare img and save it into attachment schema

    const result = await Patient.findOneAndUpdate(
      { _id: req.body.id },
      { $set: data },
      { new: true },
    ).populate('img');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const result = await Patient.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activatePatient = async (req, res, next) => {
  try {
    const result = await Patient.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.filterPatients = async (req, res, next) => {
  try {
    let query = {}
    let { gender, startDate, endDate, status } = req.query
    if (gender) query.gender = gender
    if (status) query.patientStatus = status
    if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
    // if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Patient.find(query)
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.searchPatients = async (req, res, next) => {
  try {
    const result = await Patient.find({ $text: { $search: req.body.search } })
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.topTenPatients = async (req, res) => {
  try {
    let query = { isDeleted: false };

    const patientResult = await Patient.find(query)
      .sort({ conditionAmount: -1 })
      .limit(10)
      .populate('img').populate({
        path: 'relatedMember',
        model: 'Members',
        populate: {
          path: 'relatedDiscount',
          model: 'Discounts'
        }
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
      }).populate({
        path: 'relatedTreatmentSelection',
        model: 'TreatmentSelections',
        populate: {
          path: 'relatedTreatment',
          model: 'Treatments'
        }
      }).populate({
        path: 'relatedPackageSelection',
        model: 'PackageSelections',
        populate: {
          path: 'relatedPackage',
          model: 'Packages',
          populate: {
            path: 'relatedTreatments',
            model: 'Treatments'
          }
        }
      });
    return res.status(200).send({ success: true, data: patientResult });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};
