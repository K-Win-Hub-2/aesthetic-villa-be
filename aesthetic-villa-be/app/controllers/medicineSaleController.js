'use strict';
const MedicineSale = require('../models/medicineSale');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');
const Patient = require('../models/patient');
const MedicineItems = require('../models/medicineItem');
const Log = require('../models/log');
exports.getwithExactDate = async (req, res) => {
  try {
    let { exact } = req.query;
    const date = new Date(exact);
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Set start date to the beginning of the day
    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // Set end date to the beginning of the next day
    let result = await MedicineSale.find({ createdAt: { $gte: startDate, $lt: endDate } }).populate('relatedPatient relatedTransaction relatedCash').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy')
    if (result.length === 0) return res.status(404).send({ error: true, message: 'Not Found!' })
    return res.status(200).send({ success: true, data: result })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.listAllMedicineSales = async (req, res) => {
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
    let result = await MedicineSale.find(query).populate('relatedPatient').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment relatedBank relatedCash').populate('createdBy').populate({
      path: 'relatedTransaction',
      populate: [{
        path: 'relatedAccounting',
        model: 'AccountingLists'
      }, {
        path: 'relatedBank',
        model: 'AccountingLists'
      }, {
        path: 'relatedCash',
        model: 'AccountingLists'
      }]
    });
    console.log(result)
    count = await MedicineSale.find(query).count();
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
    console.log(e)
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getMedicineSale = async (req, res) => {
  const result = await MedicineSale.find({ _id: req.params.id, isDeleted: false }).populate('relatedPatient relatedTransaction').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy')
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createCode = async (req, res, next) => {
  let data = {}
  try {
    const latestDocument = await MedicineSale.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
    if (latestDocument.length == 0) data = { ...data, seq: 1, voucherCode: "MVC-1" } // if seq is undefined set initial patientID and seq
    if (latestDocument.length) {
      const increment = latestDocument[0].seq + 1
      data = { ...data, voucherCode: "MVC-" + increment, seq: increment }
    }
    return res.status(200).send({
      success: true,
      data: data
    })
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err
    })
  }
}

exports.createMedicineSale = async (req, res, next) => {
  let data = req.body;
  const { medicineItems } = req.body;
  let createdBy = req.credentials.id
  try {
    //prepare CUS-ID
    const latestDocument = await MedicineSale.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
    if (latestDocument.length == 0) data = { ...data, seq: 1, voucherCode: "MVC-1" } // if seq is undefined set initial patientID and seq
    if (latestDocument.length) {
      const increment = latestDocument[0].seq + 1
      data = { ...data, voucherCode: "MVC-" + increment, seq: increment }
    }
    // //_________COGS___________
    // const medicineResult = await MedicineItems.find({ _id: { $in: req.body.medicineItems.map(item => item.item_id) } })
    // const purchaseTotal = medicineResult.reduce((accumulator, currentValue) => accumulator + currentValue.purchasePrice, 0)

    // const inventoryResult = Transaction.create({
    //   "amount": purchaseTotal,
    //   "date": Date.now(),
    //   "remark": req.body.remark,
    //   "relatedAccounting": "64a8e06755a87deaea39e17b", //Medicine inventory
    //   "type": "Credit",
    //   "createdBy": createdBy
    // })
    // var inventoryAmountUpdate = await Accounting.findOneAndUpdate(
    //   { _id: "64a8e06755a87deaea39e17b" },  // Medicine inventory
    //   { $inc: { amount: -purchaseTotal } }
    // )
    // const COGSResult = Transaction.create({
    //   "amount": purchaseTotal,
    //   "date": Date.now(),
    //   "remark": req.body.remark,
    //   "relatedAccounting": "64a8e10b55a87deaea39e193", //Medicine Sales COGS
    //   "type": "Debit",
    //   "relatedTransaction": inventoryResult._id,
    //   "createdBy": createdBy
    // })
    // var inventoryUpdate = await Transaction.findOneAndUpdate(
    //   { _id: inventoryResult._id },
    //   {
    //     relatedTransaction: COGSResult._id
    //   },
    //   { new: true }
    // )
    // var COGSUpdate = await Accounting.findOneAndUpdate(
    //   { _id: "64a8e10b55a87deaea39e193" },  //Medicine Sales COGS
    //   { $inc: { amount: purchaseTotal } }
    // )
    // //_________END_OF_COGS___________

    // //first transaction 
    // const fTransaction = new Transaction({
    //   "amount": data.payAmount,
    //   "date": Date.now(),
    //   "remark": req.body.remark,
    //   "relatedAccounting": "648095b57d7e4357442aa457", //Sales Medicines
    //   "type": "Credit",
    //   "createdBy": createdBy
    // })
    // const fTransResult = await fTransaction.save()
    // var amountUpdate = await Accounting.findOneAndUpdate(
    //   { _id: "648095b57d7e4357442aa457" },  //Sales Medicines
    //   { $inc: { amount: data.payAmount } }
    // )
    // //sec transaction
    // const secTransaction = new Transaction(
    //   {
    //     "amount": data.payAmount,
    //     "date": Date.now(),
    //     "remark": req.body.remark,
    //     "relatedBank": req.body.relatedBank,
    //     "relatedCash": req.body.relatedCash,
    //     "type": "Debit",
    //     "relatedTransaction": fTransResult._id,
    //     "createdBy": createdBy
    //   }
    // )
    // const secTransResult = await secTransaction.save();
    // var fTransUpdate = await Transaction.findOneAndUpdate(
    //   { _id: fTransResult._id },
    //   {
    //     relatedTransaction: secTransResult._id
    //   },
    //   { new: true }
    // )
    // if (req.body.relatedBankAccount) {
    //   var amountUpdate = await Accounting.findOneAndUpdate(
    //     { _id: req.body.relatedBankAccount },
    //     { $inc: { amount: data.payAmount } }
    //   )
    // } else if (req.body.relatedCash) {
    //   var amountUpdate = await Accounting.findOneAndUpdate(
    //     { _id: req.body.relatedCash },
    //     { $inc: { amount: data.payAmount } }
    //   )
    // }
    // let objID = ''
    // if (req.body.relatedBank) objID = req.body.relatedBank
    // if (req.body.relatedCash) objID = req.body.relatedCash
    // //transaction
    // const acc = await Accounting.find({ _id: objID })
    // const accResult = await Accounting.findOneAndUpdate(
    //   { _id: objID },
    //   { amount: parseInt(req.body.payAmount) + parseInt(acc[0].amount) },
    //   { new: true },
    // )

    data = { ...data, createdBy: createdBy }
    if (medicineItems !== undefined) {
      for (const e of medicineItems) {
        let totalUnit = e.stock - e.qty
        const result = await MedicineItems.find({ _id: e.item_id, isDeleted: false })
        const from = result[0].fromUnit
        const to = result[0].toUnit
        const currentQty = (from * totalUnit) / to
        try {
          const result = await MedicineItems.findOneAndUpdate(
            { _id: e.item_id },
            { totalUnit: totalUnit, currentQuantity: currentQty },
            { new: true },
          )
        } catch (error) {
          return res.status(500).send({ error: true, message: error.message })
        }
        const logResult = await Log.create({
          "relatedTreatmentSelection": null,
          "relatedAppointment": null,
          "relatedMedicineItems": e.item_id,
          "currentQty": e.stock,
          "actualQty": e.actual,
          "finalQty": totalUnit,
          "type": "Medicine Sale",
          "relatedBranch": relatedBranch,
          "createdBy": createdBy
        })
      }
    }
    const newMedicineSale = new MedicineSale(data)
    const medicineSaleResult = await newMedicineSale.save()
    res.status(200).send({
      message: 'MedicineSale Transaction success',
      success: true,
      data: newMedicineSale
      // fTrans: fTransUpdate,
      // sTrans: secTransResult,
      // accResult: accResult,
      // data: medicineSaleResult
    });

  } catch (error) {
    //console.log(error)
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.createMedicineSaleTransaction = async (req, res, next) => {
  try {
    let objID = ''
    if (req.body.relatedBank) objID = req.body.relatedBank
    if (req.body.relatedCash) objID = req.body.relatedCash
    //transaction
    const acc = await Accounting.find({ _id: objID })
    const accResult = await Accounting.findOneAndUpdate(
      { _id: objID },
      { amount: parseInt(req.body.amount) + parseInt(acc[0].amount) },
      { new: true },
    )

    const newMedicineSale = new MedicineSale(req.body)
    const medicineSaleResult = newMedicineSale.save()
    res.status(200).send({
      message: 'MedicineSale Transaction success',
      success: true,
      fTrans: fTransResult,
      sTrans: secTransResult,
      accResult: accResult,
      data: medicineSaleResult
    });


  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};


exports.updateMedicineSale = async (req, res, next) => {
  try {
    const result = await MedicineSale.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedPatient relatedTransaction').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy');
    if (!result) return res.status(500).send({ error: true, message: 'Query Error!' })
    if (result === 0) return res.status(500).send({ error: true, message: 'No Records!' })
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteMedicineSale = async (req, res, next) => {
  try {
    const result = await MedicineSale.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateMedicineSale = async (req, res, next) => {
  try {
    const result = await MedicineSale.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.createCode = async (req, res, next) => {
  let data = {}
  try {
    const latestDocument = await MedicineSale.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
    if (latestDocument.length == 0) data = { ...data, seq: 1, voucherCode: "MVC-1" } // if seq is undefined set initial patientID and seq
    if (latestDocument.length) {
      const increment = latestDocument[0].seq + 1
      data = { ...data, voucherCode: "MVC-" + increment, seq: increment }
    }
    return res.status(200).send({
      success: true,
      data: data
    })
  } catch (err) {
    return res.status(500).send({
      error: true,
      message: err
    })
  }
}

exports.filterMedicineSales = async (req, res, next) => {
  try {
    let query = {}
    const { start, end } = req.query
    if (start && end) query.originalDate = { $gte: start, $lte: end }
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await MedicineSale.find(query).populate('relatedPatient relatedTransaction').populate('relatedAppointment').populate('medicineItems.item_id').populate('relatedTreatment').populate('createdBy');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.confirmTransaction = async (req, res, next) => {
  try {
    //first transaction 
    const fTransaction = new Transaction({
      "amount": req.body.amount,
      "date": Date.now(),
      "remark": req.body.remark,
      "relatedAccounting": req.body.relatedAccounting,
      "type": "Credit"
    })
    const fTransResult = await fTransaction.save()
    //sec transaction
    const secTransaction = new Transaction(
      {
        "amount": req.body.amount,
        "date": Date.now(),
        "remark": req.body.remark,
        "relatedBank": req.body.relatedBank,
        "relatedCash": req.body.relatedCash,
        "type": "Debit",
        "relatedTransaction": fTransResult._id
      }
    )
    const secTransResult = await secTransaction.save();
    return res.status(200).send({ success: true, fTransResult: fTransResult, secTransResult: secTransResult })
  } catch (error) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.MedicineSaleFilter = async (req, res) => {
  let query = { relatedBank: { $exists: true }, isDeleted: false }
  try {
    const { start, end, createdBy } = req.query
    if (start && end) query.createdAt = { $gte: start, $lt: end }
    if (createdBy) query.createdBy = createdBy
    const bankResult = await MedicineSale.find(query).populate('relatedBank relatedTreatment relatedPatient relatedAppointment medicineItems.item_id relatedCash relatedAccount relatedTransaction').populate('createdBy', 'givenName')
    const { relatedBank, ...query2 } = query;
    query2.relatedCash = { $exists: true };
    const cashResult = await MedicineSale.find(query2).populate('relatedBank relatedTreatment relatedPatient relatedAppointment medicineItems.item_id relatedCash relatedAccount relatedTransaction').populate('createdBy', 'givenName')
    const BankNames = bankResult.reduce((result, { relatedBank, totalAmount }) => {
      const { name } = relatedBank;
      result[name] = (result[name] || 0) + totalAmount;
      return result;
    }, {});
    const CashNames = cashResult.reduce((result, { relatedCash, totalAmount }) => {
      const { name } = relatedCash;
      result[name] = (result[name] || 0) + totalAmount;
      return result;
    }, {});
    const BankTotal = bankResult.reduce((total, sale) => total + sale.totalAmount, 0);
    const CashTotal = cashResult.reduce((total, sale) => total + sale.totalAmount, 0);

    return res.status(200).send({
      success: true,
      data: {
        BankList: bankResult,
        CashList: cashResult,
        BankNames: BankNames,
        CashNames: CashNames,
        BankTotal: BankTotal,
        CashTotal: CashTotal
      }
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}
