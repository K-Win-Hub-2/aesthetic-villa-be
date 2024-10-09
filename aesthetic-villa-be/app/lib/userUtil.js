const bcrypt = require('bcryptjs');
const AccountBalance = require('../models/accountBalance');
const Accounting = require('../models/accountingList');
const FixedAsset = require('../models/fixedAsset');
const Transaction = require('../models/transaction');
const nodemailer = require('nodemailer');
const config = require('../../config/db');
const Excel = require('exceljs');
const workbook = new Excel.Workbook();
const Doctor = require('../models/doctor');
const Patient = require('../models/patient')
const Treatment = require('../models/treatment');

function getInitialsInUpperCase(inputString) {
  const words = inputString.split(' ');
  const initials = words.map(word => word.charAt(0).toUpperCase());
  return initials.join('');
}

async function readExcelDataForPatient(filePath, seq) {
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  const data = [];
  let seqNo = seq
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {  // Skip the header row
      const name = getInitialsInUpperCase(row.getCell(3).value)
      data.push({
        patientID: 'CUS-' + name + '-' + (seqNo + 1),
        name: row.getCell(3).value,
        phone: row.getCell(4).value,
        email: row.getCell(5).value,
        seq: seqNo + 1
        // ... map other fields accordingly
      });
      seqNo++
    }
  });

  return data;
}

async function readExcelDataForTreatmentVoucher(filePath) {
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  const data = [];

  const rows = worksheet.getRows(2, worksheet.actualRowCount);
  //console.log(rows)
  for (const row of rows) {
    if (row.getCell(2).value) {
      let treatmentName = row.getCell(6).value;
      try {
        const relatedDoctor = await Doctor.findOne({ name: row.getCell(3).value, isDeleted: false });
        const relatedPatient = await Patient.findOne({ name: row.getCell(5).value, isDeleted: false });
        const relatedTreatment = await Treatment.findOne({ name: treatmentName ? treatmentName.split('__')[0] : row.getCell(6).value, isDeleted: false });

        if (relatedDoctor && relatedPatient && relatedTreatment) {
          const rowData = {
            relatedPatient: relatedPatient?._id,
            relatedDoctor: relatedDoctor?._id,
            relatedTreatment: relatedTreatment?._id,
            paidAmount: row.getCell(13).value?.result,
            totalDiscount: row.getCell(11)?.result,
            remark: row.getCell(14).value,
            relatedCash: '64ae121d12b3d31436d47e52'
            // ... map other fields accordingly
          };
          data.push(rowData);
        }
      } catch (error) {
        console.error("Error processing row:", error);
      }
    }
  }

  return data;
}





//https://myaccount.google.com/apppasswords
const getClosingLastDay = async (id, start, end) => {
  const abResult = await AccountBalance.find({
    relatedAccounting: id,
    type: 'Closing',
    date: { $gte: start, $lte: end }
  })
  const total = abResult.reduce(
    (acc, curr) => acc + Number.parseInt(curr.amount),
    0
  )
  return total
}
// Create a transporter using your Gmail account credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.senderEmail, // Replace with your Gmail email address
    pass: config.senderPassword // Replace with your Gmail password or an app-specific password if you have enabled 2-step verification
  }
});

// Send the email
async function sendEmail(mailOptions) {
  const result = transporter.sendMail(mailOptions);
  return result
}

async function filterRequestAndResponse(reArr, reBody) {
  if (reArr.length > 0) {
    const result = {};
    reArr.map((req) => {
      result[req] = reBody[req];
    })
    return result;
  }
  return;
}

async function bcryptHash(password) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return hashedPassword
}

async function bcryptCompare(plain, hash) {
  const result = await bcrypt.compare(plain, hash)
  return result
}

async function getLatestDay() {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get the number of days in the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  return currentDay === lastDayOfMonth;
}

async function fixedAssetTransaction() {
  try {
    const assetResult = await FixedAsset.find({}).populate('fixedAssetAcc depriciationAcc')
    for (const element of assetResult) {
      let { yearDepriciation, fixedAssetAcc, usedYear, depriciationAcc } = element
      if (yearDepriciation && fixedAssetAcc && usedYear) {
        const amount = yearDepriciation / 12
        var transResult = await Transaction.create({
          "amount": amount,
          "date": Date.now(),
          "remark": data.remark,
          "type": "Credit",
          "relatedTransaction": null,
          "relatedAccounting": fixedAssetAcc,
        })
        var secTransResult = await Transaction.create({
          "amount": amount,
          "date": Date.now(),
          "remark": data.remark,
          "type": "Debit",
          "relatedTransaction": transResult._id,
          "relatedAccounting": depriciationAcc,
        })
        var transUpdate = await Transaction.findOneAndUpdate({
          _id: transResult._id
        }, { relatedTransaction: secTransResult._id }, { new: true })

        const transResultAmtUpdate = await Accounting.findOneAndUpdate(
          { _id: fixedAssetAcc },
          { $inc: { amount: -amount } }
        )

        const secTransResultAmtUpdate = await Accounting.findOneAndUpdate(
          { _id: depriciationAcc },
          { $inc: { amount: amount } }
        )
      }
    }
    console.log('Task is complete!')
  } catch (error) {
    console.log(error)
  }
}

async function createAccountBalance() {
  const accountingResult = await Accounting.find({})
  for (const item of accountingResult) {
    //get closing account
    const query = { relatedAccounting: item._id, type: 'Closing' };
    const sort = { _id: -1 }; // Sort by descending _id to get the latest document
    const latestClosingDocument = await AccountBalance.findOne(query, null, { sort });
    var todayTimestamp = Date.now();

    // Create a new Date object for today using the timestamp
    var today = new Date(todayTimestamp);

    // Create a new Date object for tomorrow by adding one day's worth of milliseconds
    var tomorrow = new Date(todayTimestamp);
    tomorrow.setDate(today.getDate() + 1);
    if (latestClosingDocument) {
      var closingResult = await AccountBalance.create({
        relatedAccounting: item._id,
        amount: latestClosingDocument.amount,
        type: 'Closing',
        date: Date.now(),
        remark: null,
        relatedBranch: null
      })
      var openingResult = await AccountBalance.create({
        relatedAccounting: item._id,
        amount: latestClosingDocument.amount,
        type: 'Opening',
        date: tomorrow,
        remark: null,
        relatedBranch: null
      })

    } else {
      var closingRes = await AccountBalance.create({
        relatedAccounting: item._id,
        amount: 0,
        type: 'Closing',
        date: Date.now(),
        remark: null,
        relatedBranch: null
      })
      var result = await AccountBalance.create({
        relatedAccounting: item._id,
        amount: 0,
        type: 'Opening',
        date: tomorrow,
        remark: null,
        relatedBranch: null
      })
    }

    console.log('Successful', item.name)
  }
}

async function mergeAndSum(data) {
  const BankNames = {};
  const CashNames = {};
  let BankTotal = 0;
  let CashTotal = 0;

  for (const value of Object.values(data)) {
    if (value.BankNames) {
      for (const [bankName, bankValue] of Object.entries(value.BankNames)) {
        BankNames[bankName] = (BankNames[bankName] || 0) + bankValue;
      }
    }

    if (value.CashNames) {
      for (const [cashName, cashValue] of Object.entries(value.CashNames)) {
        CashNames[cashName] = (CashNames[cashName] || 0) + cashValue;
      }
    }

    BankTotal += value.BankTotal || 0;
    CashTotal += value.CashTotal || 0;
  }

  return {
    BankNames,
    CashNames,
    BankTotal,
    CashTotal,
  };
}

const getNetAmount = async (id, start, end) => {
  const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
  const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);
  const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
  const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);
  return totalDebit - totalCredit
}

async function getTotal(table) {
  const total = table.reduce((accumulator, element) => {
    if (element.operator === 'Plus') {
      accumulator = accumulator + element.amount
    } else if (element.operator === 'Minus') {
      accumulator = accumulator - element.amount
    }
    return accumulator
  }, 0)
  return total
}

module.exports = { readExcelDataForTreatmentVoucher, readExcelDataForPatient, bcryptHash, bcryptCompare, filterRequestAndResponse, getClosingLastDay, mergeAndSum, getLatestDay, createAccountBalance, fixedAssetTransaction, getNetAmount, getTotal, sendEmail };
