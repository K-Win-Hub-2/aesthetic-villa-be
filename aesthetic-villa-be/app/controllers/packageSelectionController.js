'use strict';
const PackageSelection = require('../models/packageSelection');
const Appointment = require('../models/appointment');
const Transaction = require('../models/transaction');
const Patient = require('../models/patient');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Repay = require('../models/repayRecord');
const Accounting = require('../models/accountingList');
const Attachment = require('../models/attachment');
const AdvanceRecords = require('../models/advanceRecord');
const TreatmentSelection = require('../models/treatmentSelection');
const Package = require('../models/treatment');
const Treatment = require('../models/treatment')
const MedicineItems = require('../models/medicineItem');
const AccessoryItems = require('../models/accessoryItem');
const ProcedureItems = require('../models/procedureItem');
const Debt = require('../models/debt');

exports.listAllPackageSelections = async (req, res) => {
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
        let result = await PackageSelection.find(query)
        let count = await PackageSelection.find(query).count();
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
    } catch (error) {
        return res.status(500).send({ error: true, message: 'No Record Found!' });
    }
};

exports.getAppointmentsForPackageSelection = async (req, res) => {
    try {
        let { relatedPackageSelection, relatedTreatment } = req.query;
        const appointmentResult = await Appointment.find({ relatedPackageSelection: relatedPackageSelection, relatedTreatment: relatedTreatment })
        return res.status(200).send({ success: true, data: appointmentResult })
    } catch (error) {
        return res.status(500).send({
            error: true,
            message: error.message
        })
    }
}

exports.getPackageSelection = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query._id = req.params.id
    const result = await PackageSelection.find(query)
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getTreatementSelectionByTreatmentID = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query.relatedTreatment = req.params.id
    const result = await PackageSelection.find(query).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
        path: 'relatedTreatment',
        model: 'Treatments',
        populate: {
            path: 'relatedDoctor',
            model: 'Doctors'
        }
    })
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createPackageSelectionCode = async (req, res) => {
    let data = req.body;
    try {
        //prepare TS-ID
        const latestDocument = await PackageSelection.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument[0].seq === undefined) data = { ...data, seq: 1, code: "PS-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument[0].seq) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, code: "PS-" + increment, seq: increment }
        }
        return res.status(200).send({
            success: true,
            data: data
        })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.appointmentGenerate = async (req, res) => {
    let relatedAppointments = []
    const dataconfigs = [];
    
    let { relatedTreatmentSelection, totalAmount, relatedPatient, relatedDoctor, originalDate, relatedBranch, treatmentTimes, inBetweenDuration, relatedPackageSelection, relatedTreatment, phone } = req.body
 //   let { relatedPatient, relatedDoctor, originalDate, relatedBranch, treatmentTimes, inBetweenDuration, relatedPackageSelection, relatedTreatmentSelection, relatedTreatment, phone } = req.body
    if (originalDate === undefined) return res.status(500).send({ error: true, message: 'Original Date is required' })
    const appointmentConfig = {
        relatedPatient: relatedPatient,
        relatedDoctor: relatedDoctor,
        originalDate: new Date(originalDate), // Convert to Date object
        phone: phone,
        relatedBranch: relatedBranch,
        relatedPackageSelection: relatedPackageSelection,
        relatedTreatmentSelection: relatedTreatmentSelection,
        relatedTreatment: relatedTreatment,
    };
    const numTreatments = treatmentTimes;
    for (let i = 0; i < numTreatments; i++) {
        const date = new Date(appointmentConfig.originalDate);
        date.setDate(date.getDate() + (i * inBetweenDuration)); // Add 7 days for each iteration
        const config = { ...appointmentConfig, originalDate: date };
        dataconfigs.push(config);
    }
    const appointmentResult = await Appointment.insertMany(dataconfigs)
    appointmentResult.map(function (element, index) {
        relatedAppointments.push(element._id)
    })

    
    const dividedPrice = (totalAmount / treatmentTimes).toFixed(2);
    const perAppointmentPrices =  (totalAmount / treatmentTimes).toFixed(2);
    const deferRevenues = totalAmount ;
    console.log("reached ",JSON.stringify(perAppointmentPrices), JSON.stringify(deferRevenues) )
    
    const treatmentSelectionUpdate = await TreatmentSelection.findOneAndUpdate({ _id: req.body.relatedTreatmentSelection }, { $push: { relatedAppointments: relatedAppointments }  },// perAppointmentPrices, deferRevenues, 
                                   { new: true });
    
    const addPerAppointmentPrice = await TreatmentSelection.findByIdAndUpdate(req.body.relatedTreatmentSelection,
                                        {
                                            perAppointmentPrice : dividedPrice,
                                            deferRevenue : deferRevenues
                                        })
    
    //show update treatment selection
    const updatedTreatmentSelection = await TreatmentSelection.findById(req.body.relatedTreatmentSelection);
    const populatedAppointments = await Appointment.find({ _id: { $in: appointmentResult.map(item => item._id) } }).populate('relatedDoctor');
    const patientUpdate = await Patient.findOneAndUpdate({ _id: relatedPatient }, { relatedAppointments: relatedAppointments, createdBy: req.credentials.id, $inc: { remainingAppointments: relatedAppointments.length, totalAppointments: relatedAppointments.length, unfinishedAppointments: relatedAppointments.length } });
    if (relatedTreatmentSelection) var tsResult = await TreatmentSelection.findOneAndUpdate({ _id: relatedTreatmentSelection }, { $addToSet: { relatedAppointments: relatedAppointments, } }, { new: true })
    return res.status(200).send({ success: true, data: populatedAppointments, relatedAppointments: relatedAppointments, tsResult: tsResult })
}

exports.createPackageSelection = async (req, res, next) => {
    let data = req.body;
    let relatedAppointments = []
    let tvcCreate = false;
    let createdBy = req.credentials.id
    let files = req.files
    try {
        if (files.payment) {
            for (const element of files.payment) {
                let imgPath = element.path.split('cherry-k')[1];
                const attachData = {
                    fileName: element.originalname,
                    imgUrl: imgPath,
                    image: imgPath.split('\\')[2]
                };
                const attachResult = await Attachment.create(attachData);
                var attachID = attachResult._id.toString()
            }
        }

        const patientUpdate = await Patient.findOneAndUpdate(
            { _id: req.body.relatedPatient },
            { $inc: { conditionAmount: req.body.totalAmount, conditionPurchaseFreq: 1, conditionPackageQty: 1 } },
            { new: true }
        )

        data = { ...data, relatedAppointments: relatedAppointments, remainingAppointments: relatedAppointments, createdBy: createdBy, relatedBranch: req.body.relatedBranch }


        //first transaction 
        if (req.body.paymentMethod === 'Partial') {
            var fTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "date": Date.now(),
                "remark": null,
                "relatedAccounting": "64a3f2e39f17ad46313dc882", //Sales (Package)
                "type": "Credit",
                "createdBy": createdBy
            })
            var amountUpdate = await Accounting.findOneAndUpdate(
                { _id: "64a3f2e39f17ad46313dc882" },
                { $inc: { amount: req.body.paidAmount } }
            )
            //sec transaction
            var secTransResult = await Transaction.create({
                "amount": req.body.paidAmount,
                "date": Date.now(),
                "remark": null,
                "relatedBank": req.body.relatedBank,
                "relatedCash": req.body.relatedCash,
                "type": "Debit",
                "relatedTransaction": fTransResult._id,
                "createdBy": createdBy
            });
            var fTransUpdate = await Transaction.findOneAndUpdate(
                { _id: fTransResult._id },
                {
                    relatedTransaction: secTransResult._id
                },
                { new: true }
            )
            if (req.body.relatedBank) {
                var amountUpdate = await Accounting.findOneAndUpdate(
                    { _id: req.body.relatedBank },
                    { $inc: { amount: req.body.paidAmount } }
                )
            } else if (req.body.relatedCash) {
                var amountUpdate = await Accounting.findOneAndUpdate(
                    { _id: req.body.relatedCash },
                    { $inc: { amount: req.body.paidAmount } }
                )
            }
            tvcCreate = true;
        }

        //_________COGS___________\
        console.log(req.body.relatedTreatment.toString())
        let treatmentArray = JSON.parse(req.body.relatedTreatment.toString())

        const treatmentResult = await Treatment.find({ _id: { $in: treatmentArray } }).populate('procedureMedicine.item_id').populate('medicineLists.item_id').populate('procedureAccessory.item_id')
        const purchaseTotal = treatmentResult.reduce((accumulator, currentValue) => accumulator + currentValue.estimateTotalPrice, 0)
        const inventoryResult = Transaction.create({
            "amount": purchaseTotal,
            "date": Date.now(),
            "remark": req.body.remark,
            "relatedAccounting": "64a8e09055a87deaea39e181", //Treatement inventory
            "type": "Credit",
            "createdBy": createdBy
        })
        var inventoryAmountUpdate = await Accounting.findOneAndUpdate(
            { _id: "64a8e09055a87deaea39e181" },  //Treatement inventory
            { $inc: { amount: -purchaseTotal } }
        )
        var COGSResult = Transaction.create({
            "amount": purchaseTotal,
            "date": Date.now(),
            "remark": req.body.remark,
            "relatedAccounting": "64a8e69555a87deaea39e1a5", //Package Sales COGS
            "type": "Debit",
            "relatedTransaction": inventoryResult._id,
            "createdBy": createdBy
        })
        var COGSUpdate = await Accounting.findOneAndUpdate(
            { _id: "64a8e69555a87deaea39e1a5" },  //Package Sales COGS
            { $inc: { amount: purchaseTotal } }
        )

        var inventoryUpdate = await Transaction.findOneAndUpdate(
            { _id: inventoryResult._id },
            {
                relatedTransaction: COGSResult._id
            },
            { new: true }
        )

        //_________END_OF_COGS___________

        if (fTransResult && secTransResult) { data = { ...data, relatedTransaction: [fTransResult._id, secTransResult._id] } } //adding relatedTransactions to treatmentSelection model
        if (treatmentVoucherResult) { data = { ...data, relatedTreatmentVoucher: treatmentVoucherResult._id, purchaseTotal: purchaseTotal } }
        if (purchaseTotal) data.purchaseTotal = purchaseTotal
        console.log(purchaseTotal)
        const result = await PackageSelection.create(data)

        // if (req.body.paymentMethod === 'Advance') {
        //     const packageResult = await Package.find({ _id: req.body.relatedTreatment }).populate('relatedTreatments')
        //     let advanceAmount = req.body.totalAmount - req.body.paidAmount

        //     if (req.body.deferAmount > 0 && req.body.paidAmount !== 0 && req.body.cashBackAmount === 0) {
        //         var fTransResult = await Transaction.create({
        //             "amount": advanceAmount,
        //             "date": Date.now(),
        //             "remark": null,
        //             "relatedAccounting": "6467379159a9bc811d97f4d2", //Advance received from customer
        //             "type": "Debit",
        //             "createdBy": createdBy
        //         })
        //         var amountUpdate = await Accounting.findOneAndUpdate(
        //             { _id: "6467379159a9bc811d97f4d2" },a
        //             { $inc: { amount: -req.body.totalAmount } }
        //         )
        //         //sec transaction
        //         var secTransResult = await Transaction.create({
        //             "amount": req.body.paidAmount,
        //             "date": Date.now(),
        //             "remark": null,
        //             "relatedBank": req.body.relatedBank,
        //             "relatedCash": req.body.relatedCash,
        //             "type": "Debit",
        //             "relatedTransaction": fTransResult._id,
        //             "createdBy": createdBy
        //         });
        //         var fTransUpdate = await Transaction.findOneAndUpdate(
        //             { _id: fTransResult._id },
        //             {
        //                 relatedTransaction: secTransResult._id
        //             },
        //             { new: true }
        //         )
        //         if (req.body.relatedBank) {
        //             var freqSecamountUpdate = await Accounting.findOneAndUpdate(
        //                 { _id: req.body.relatedBank },
        //                 { $inc: { amount: req.body.paidAmount } }
        //             )
        //         } else if (req.body.relatedCash) {
        //             var freqSecamountUpdate = await Accounting.findOneAndUpdate(
        //                 { _id: req.body.relatedCash },
        //                 { $inc: { amount: req.body.paidAmount } }
        //             )

        //         }
        //         for (let i in packageResult.relatedTreatments) {
        //             var secTransResult2 = await Transaction.create({
        //                 "amount": req.body.totalAmount,
        //                 "date": Date.now(),
        //                 "remark": null,
        //                 "relatedAccounting": i.relatedAccount,
        //                 "type": "Credit",
        //                 "relatedTransaction": fTransResult._id,
        //                 "createdBy": createdBy
        //             });
        //             var freqSecamountUpdate2 = await Accounting.findOneAndUpdate(
        //                 { _id: i.relatedAccount },
        //                 { $inc: { amount: req.body.totalAmount } }
        //             )
        //         }
        //         const ARUpdate = await AdvanceRecords.findOneAndUpdate(
        //             { _id: req.body.advanceID },
        //             { amount: 0 },
        //             { new: true }
        //         )
        //     } else if (req.body.deferAmount < 0 && req.body.paidAmount === 0 && req.body.cashBackAmount > 0) {

        //         //sec transaction
        //         for (let i in packageResult.relatedTreatments) {
        //             var fTransResult = await Transaction.create({
        //                 "amount": req.body.totalAmount,
        //                 "date": Date.now(),
        //                 "remark": null,
        //                 "relatedAccounting": i.relatedAccount,
        //                 "type": "Credit",

        //                 "createdBy": createdBy
        //             });

        //             var amountUpdate = await Accounting.findOneAndUpdate(
        //                 { _id: i.relatedAccount },
        //                 { $inc: { amount: req.body.totalAmount } }
        //             )
        //         }
        //         var secTransResult = await Transaction.create({
        //             "amount": req.body.totalAmount,
        //             "date": Date.now(),
        //             "remark": null,
        //             "relatedAccounting": "6467379159a9bc811d97f4d2", //Advance received from customer
        //             "type": "Debit",
        //             "relatedTransaction": fTransResult._id,
        //             "createdBy": createdBy
        //         })

        //         var amountUpdate = await Accounting.findOneAndUpdate(
        //             { _id: "6467379159a9bc811d97f4d2" },
        //             { $inc: { amount: -req.body.totalAmount } }
        //         )

        //         var fTransUpdate = await Transaction.findOneAndUpdate(
        //             { _id: fTransResult._id },
        //             {
        //                 relatedTransaction: secTransResult._id
        //             },
        //             { new: true }
        //         )

        //         const ARUpdate = await AdvanceRecords.findOneAndUpdate(
        //             { _id: req.body.advanceID },
        //             { amount: req.body.cashBackAmount },
        //             { new: true }
        //         )

        //     } else if (req.body.deferAmount === 0 && req.boy.paidAmount === 0 && req.body.cashBackAmount === 0) {
        //         for (let i in packageResult.relatedTreatments) {
        //             var fTransResult = await Transaction.create({
        //                 "amount": req.body.totalAmount,
        //                 "date": Date.now(),
        //                 "remark": null,
        //                 "relatedAccounting": i.relatedAccount,
        //                 "type": "Credit",

        //                 "createdBy": createdBy
        //             });

        //             var amountUpdate = await Accounting.findOneAndUpdate(
        //                 { _id: i.relatedAccount },
        //                 { $inc: { amount: req.body.totalAmount } }
        //             )
        //         }
        //         var secTransResult = await Transaction.create({
        //             "amount": req.body.totalAmount,
        //             "date": Date.now(),
        //             "remark": null,
        //             "relatedAccounting": "6467379159a9bc811d97f4d2", //Advance received from customer
        //             "type": "Debit",
        //             "relatedTransaction": fTransResult._id,
        //             "createdBy": createdBy
        //         })

        //         var amountUpdate = await Accounting.findOneAndUpdate(
        //             { _id: "6467379159a9bc811d97f4d2" },
        //             { $inc: { amount: -req.body.totalAmount } }
        //         )

        //         var fTransUpdate = await Transaction.findOneAndUpdate(
        //             { _id: fTransResult._id },
        //             {
        //                 relatedTransaction: secTransResult._id
        //             },
        //             { new: true }
        //         )

        //         const ARUpdate = await AdvanceRecords.findOneAndUpdate(
        //             { _id: req.body.advanceID },
        //             { amount: 0 },
        //             { new: true }
        //         )
        //     }
        //     let dataTVC = {
        //         "relatedPackageSelection": result._id,
        //         "relatedPackage": req.body.relatedPackage,
        //         "relatedAppointment": req.body.relatedAppointment,
        //         "relatedPatient": req.body.relatedPatient,
        //         "paymentMethod": "pAdvance", //enum: ['by Appointment','Lapsum','Total','Advanced']
        //         "amount": req.body.totalAmount,
        //         "relatedBank": req.body.relatedBank,
        //         "bankType": req.body.bankType,//must be bank acc from accounting accs
        //         "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
        //         "relatedCash": req.body.relatedCash, //must be cash acc from accounting accs
        //         "createdBy": createdBy,
        //         "relatedBranch": req.body.relatedBranch,
        //         "remark": req.body.remark,
        //         "payment": attachID,
        //         "relatedDiscount": req.body.relatedDiscount
        //     }
        //     let today = new Date().toISOString()
        //     const latestDocument = await TreatmentVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        //     if (latestDocument.length === 0) dataTVC = { ...dataTVC, seq: 1, code: "TVC-"  + "-1" } // if seq is undefined set initial patientID and seq
        //     if (latestDocument.length > 0) {
        //         const increment = latestDocument[0].seq + 1
        //         dataTVC = { ...dataTVC, code: "TVC-"  + "-" + increment, seq: increment }
        //     }
        //     var treatmentVoucherResult = await TreatmentVoucher.create(dataTVC)
        // }

        if (req.body.paymentMethod === 'FOC') {
            let dataTVC = {
                "relatedPackageSelection": result._id,
                "secondAccount": req.body.secondAccount,
                "secondAmount": req.body.secondAmount,
                "isDouble": req.body.isDouble,
                "relatedPackage": req.body.relatedPackage,
                "relatedAppointment": req.body.relatedAppointment,
                "relatedPatient": req.body.relatedPatient,
                "paymentMethod": req.body.paymentMethod, //enum: ['by Appointment','Lapsum','Total','Advanced']
                "amount": 0,
                "relatedPackageSelection": result._id,
                "relatedPackage": req.body.relatedPackage,
                "relatedBank": req.body.relatedBank,
                "bankType": req.body.bankType,//must be bank acc from accounting accs
                "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
                "relatedCash": req.body.relatedCash, //must be cash acc from accounting accs
                "createdBy": createdBy,
                "relatedBranch": req.body.relatedBranch,
                "remark": req.body.remark,
                "payment": attachID,
                "discountAmount": req.body.discountAmount,
                "relatedDoctor": req.body.relatedDoctor,
                "tsType": 'PS',
                "balance": req.body.balance,
                "createdAt": req.body.createdAt
            }
            let today = new Date().toISOString()
            const latestDocument = await TreatmentVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
            if (latestDocument.length === 0) dataTVC = { ...dataTVC, seq: 1, code: "PVC-" + "-1" } // if seq is undefined set initial patientID and seq
            if (latestDocument.length > 0) {
                const increment = latestDocument[0].seq + 1
                dataTVC = { ...dataTVC, code: "TVC-" + "-" + increment, seq: increment }
            }
            var treatmentVoucherResult = await TreatmentVoucher.create(dataTVC)
        }
        tvcCreate = true
        if (tvcCreate === true) {
            //--> treatment voucher create
            let dataTVC = {
                "relatedPackageSelection": result._id,
                "secondAccount": req.body.secondAccount,
                "secondAmount": req.body.secondAmount,
                "isDouble": req.body.isDouble,
                "relatedPackage": req.body.relatedPackage,
                "relatedAppointment": req.body.relatedAppointment,
                "relatedPatient": req.body.relatedPatient,
                "paymentMethod": req.body.paymentMethod, //enum: ['by Appointment','Lapsum','Total','Advanced']
                "amount": req.body.paidAmount,
                "relatedBank": req.body.relatedBank,
                "bankType": req.body.bankType,//must be bank acc from accounting accs
                "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
                "relatedCash": req.body.relatedCash, //must be cash acc from accounting accs
                "createdBy": createdBy,
                "relatedBranch": req.body.relatedBranch,
                "remark": req.body.remark,
                "payment": attachID,
                "discountAmount": req.body.discountAmount,
                "relatedDoctor": req.body.relatedDoctor,
                "tsType": 'PS',
                "balance": req.body.balance,
                "createdAt": req.body.createdAt

            }
            console.log(dataTVC)
            let today = new Date().toISOString()
            const latestDocument = await TreatmentVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
            if (latestDocument.length === 0) dataTVC = { ...dataTVC, seq: 1, code: "TVC-" + "-1" } // if seq is undefined set initial patientID and seq
            if (latestDocument.length > 0) {
                const increment = latestDocument[0].seq + 1
                dataTVC = { ...dataTVC, code: "TVC-" + "-" + increment, seq: increment }
            }
            var treatmentVoucherResult = await TreatmentVoucher.create(dataTVC)
        }
        let advanceQuery = { $inc: { amount: -req.body.totalAmount } }
        if (req.body.recievedPatient) advanceQuery.recievedPatient = req.body.recievedPatient
        //freq Update Start
        const advanceResult = await AdvanceRecords.findOneAndUpdate(
            { relatedPatient: req.body.relatedPatient },
            advanceQuery,
            { new: true }
        )
        const freqUpdate = await Patient.findOneAndUpdate(
            { _id: req.body.relatedPatient },
            { $inc: { treatmentPackageQty: 1, totalAmount: req.body.totalAmount } },
            { new: true }
        )
        var freqfTransResult = await Transaction.create({
            "amount": req.body.paidAmount,
            "date": Date.now(),
            "remark": null,
            "relatedAccounting": "64a3f2e39f17ad46313dc882", //Sales Package
            "type": "Credit",
            "createdBy": createdBy
        })
        var freqamountUpdate = await Accounting.findOneAndUpdate(
            { _id: "64a3f2e39f17ad46313dc882" },
            { $inc: { amount: -req.body.paidAmount } }
        )
        //sec transaction
        var freqSecTransResult = await Transaction.create({
            "amount": req.body.paidAmount,
            "date": Date.now(),
            "remark": null,
            "relatedBank": req.body.relatedBank,
            "relatedCash": req.body.relatedCash,
            "type": "Debit",
            "relatedTransaction": freqfTransResult._id,
            "createdBy": createdBy
        });
        var freqfTransUpdate = await Transaction.findOneAndUpdate(
            { _id: freqfTransResult._id },
            {
                relatedTransaction: freqSecTransResult._id
            },
            { new: true }
        )
        if (req.body.relatedBank) {
            var freqSecamountUpdate = await Accounting.findOneAndUpdate(
                { _id: req.body.relatedBank },
                { $inc: { amount: req.body.paidAmount } }
            )
        } else if (req.body.relatedCash) {
            var freqSecamountUpdate = await Accounting.findOneAndUpdate(
                { _id: req.body.relatedCash },
                { $inc: { amount: req.body.paidAmount } }
            )
        }
        //Freq Update end
        const populatedResult = await PackageSelection.find({ _id: result._id }).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient').populate({
            path: 'relatedPackage',
            model: 'Packages',
            populate: {
                path: 'relatedTreatments',
                model: 'Treatments'
            }
        }).populate({
            path: 'relatedAppointments',
            model: 'Appointments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
        const accResult = await Appointment.findOneAndUpdate(
            { _id: req.body.appointment },
            { $addToSet: { relatedPackageSelection: result._id } },
            { new: true },
        )
        if (data.relatedPatient) {
            const patientResult = await Patient.findOneAndUpdate(
                { _id: req.body.relatedPatient },
                { $addToSet: { relatedPackageSelection: result._id } },
                { new: true }
            )
        }
        if (treatmentVoucherResult) {
            var populatedTV = await TreatmentVoucher.find({ _id: treatmentVoucherResult._id }).populate('relatedDiscount')
        }
        if (req.body.balance > 0) {
            const debtCreate = await Debt.create({
                "balance": req.body.balance,
                "relatedPatient": data.relatedPatient,
                "relatedTreatmentVoucher": treatmentVoucherResult._id
            })
            var updateDebt = await Patient.findOneAndUpdate({ _id: req.body.relatedPatient }, { $inc: { debtBalance: req.body.balance } })

        }

        let response = {
            message: 'Treatment Selection create success',
            success: true,
            data: populatedResult,
            patientFreqUpdate: freqUpdate,
            purchaseTotal: purchaseTotal
            // fTransResult: fTransResult,
            // secTransResult: secTransResult,
            // treatmentVoucherResult:treatmentVoucherResult
        }
        if (populatedTV) response.treatmentVoucherResult = populatedTV
        // if (fTransUpdate) response.fTransResult = fTransUpdate
        // if (fTransResult) response.secTransResult = secTransResult
        res.status(200).send(response);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updatePackageSelection = async (req, res, next) => {
    try {
        let data = req.body;
        if (data.paidAmount) {
            data = { ...data, leftOverAmount: data.totalAmount - data.paidAmount } // leftOverAmount Calculation
        }
        if (data.paidAmount === 0) data = { ...data, leftOverAmount: data.totalAmount }
        const result = await PackageSelection.findOneAndUpdate(
            { _id: req.body.id },
            data,
            { new: true },
        ).populate('relatedTreatment');
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

// exports.treatmentPayment = async (req, res, next) => {
//     let data = req.body;
//     let createdBy = req.credentials.id;
//     let files = req.files;
//     try {
//         let { paidAmount } = data;
//         const treatmentSelectionQuery = await PackageSelection.find({ _id: req.body.id, isDeleted: false }).populate('relatedTreatment').populate('relatedAppointments');
//         const result = await PackageSelection.findOneAndUpdate(
//             { _id: req.body.id },
//             { $inc: { leftOverAmount: -paidAmount }, paidAmount: paidAmount },
//             { new: true },
//         ).populate('relatedTreatment');
//         if (files.payment) {
//             for (const element of files.payment) {
//                 let imgPath = element.path.split('cherry-k')[1];
//                 const attachData = {
//                     fileName: element.originalname,
//                     imgUrl: imgPath,
//                     image: imgPath.split('\\')[2]
//                 };
//                 const attachResult = await Attachment.create(attachData);
//                 var attachID = attachResult._id.toString()
//             }
//         }
//         if (result.paymentMethod === 'Credit') { //
//             let dataTVC = {
//                 "relatedPackageSelection": result._id,
//                 "relatedPackage": req.body.relatedPackage,
//                 "relatedAppointment": req.body.relatedAppointment,
//                 "relatedPatient": req.body.relatedPatient,
//                 "paymentMethod": 'by Appointment', //enum: ['by Appointment','Lapsum','Total','Advanced']
//                 "amount": paidAmount,
//                 "relatedBank": req.body.relatedBank, //must be bank acc from accounting accs
//                 "bankType": req.body.bankType,
//                 "paymentType": req.body.paymentType, //enum: ['Bank','Cash']
//                 "relatedCash": req.body.relatedCash,
//                 "createdBy": createdBy, //must be cash acc from accounting accs
//                 "relatedBranch": req.body.relatedBranch,
//                 "remark": req.body.remark,
//                 "payment": attachID,
//                 "relatedDiscount": req.body.relatedDiscount

//             }
//             let today = new Date().toISOString()
//             const latestDocument = await TreatmentVoucher.find({}, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
//             if (latestDocument.length === 0) dataTVC = { ...dataTVC, seq: 1, code: "TVC-"  + "-1" } // if seq is undefined set initial patientID and seq
//             if (latestDocument.length > 0) {
//                 const increment = latestDocument[0].seq + 1
//                 dataTVC = { ...dataTVC, code: "TVC-"  + "-" + increment, seq: increment }
//             }
//             var treatmentVoucherResult = await TreatmentVoucher.create(dataTVC)
//             //transaction
//             var fTransResult = await Transaction.create({
//                 "amount": req.body.paidAmount,
//                 "relatedBranch": req.body.relatedBranch,
//                 "date": Date.now(),
//                 "remark": null,
//                 "relatedAccounting": result.relatedTreatment.relatedAccount,
//                 "type": "Credit",
//                 "createdBy": createdBy,
//                 "relatedBranch": { isDeleted: false }.relatedBranch
//             })
//             if (result.relatedTreatment.relatedAccount) {
//                 var amountUpdate = await Accounting.findOneAndUpdate(
//                     { _id: result.relatedTreatment.relatedAccount },
//                     { $inc: { amount: req.body.paidAmount } }
//                 )
//             }
//             //sec transaction
//             var secTransResult = await Transaction.create({
//                 "amount": req.body.paidAmount,
//                 "relatedBranch": req.body.relatedBranch,
//                 "date": Date.now(),
//                 "remark": null,
//                 "relatedBank": req.body.relatedBank,
//                 "relatedCash": req.body.relatedCash,
//                 "type": "Debit",
//                 "relatedTransaction": fTransResult._id,
//                 "createdBy": createdBy,
//                 "relatedBranch": { isDeleted: false }.relatedBranch
//             });
//             var fTransUpdate = await Transaction.findOneAndUpdate(
//                 { _id: fTransResult._id },
//                 {
//                     relatedTransaction: secTransResult._id
//                 },
//                 { new: true }
//             )
//             if (req.body.relatedBank) {
//                 var amountUpdate = await Accounting.findOneAndUpdate(
//                     { _id: req.body.relatedBank },
//                     { $inc: { amount: req.body.paidAmount } }
//                 )
//             } else if (req.body.relatedCash) {
//                 var amountUpdate = await Accounting.findOneAndUpdate(
//                     { _id: req.body.relatedCash },
//                     { $inc: { amount: req.body.paidAmount } }
//                 )
//             }
//         } else if (result.paymentMethod === 'Cash Down') { //byAppointment
//             // const treatmentVoucherResult = await TreatmentVoucher.create(
//             //     {
//             //         "relatedPackage": req.body.relatedPackage,
//             //         "relatedAppointment": req.body.relatedAppointment,
//             //         "relatedPatient": req.body.relatedPatient,
//             //         "paymentMethod": 'by Appointment', //enum: ['by Appointment','Lapsum','Total','Advanced']
//             //         "amount": paidAmount,
//             //     }
//             // )

//             var repayRecord = await Repay.create({
//                 relatedAppointment: req.body.relatedAppointment,
//                 relatedPackageSelection: req.body.id,
//                 paidAmount: req.body.paidAmount,
//                 relatedBranch: req.body.relatedBranch
//             })
//             var rpRecordPopulated = await Repay.find({ _id: repayRecord._id }).populate('relatedAppointment')
//             //transaction
//             var fTransResult = await Transaction.create({
//                 "amount": req.body.paidAmount,
//                 "date": Date.now(),
//                 "remark": null,
//                 "relatedBranch": req.body.relatedBranch,
//                 "relatedAccounting": "6467379159a9bc811d97f4d2", //Advance received from customer
//                 "type": "Debit", //minus
//                 "createdBy": createdBy,
//                 "relatedBranch": { isDeleted: false }.relatedBranch
//             })
//             //sec transaction
//             var secTransResult = await Transaction.create({
//                 "amount": req.body.paidAmount,
//                 "date": Date.now(),
//                 "remark": null,
//                 "relatedBranch": req.body.relatedBranch,
//                 "relatedAccounting": result.relatedTreatment.relatedAccount,
//                 "type": "Credit", //plus
//                 "relatedTransaction": fTransResult._id,
//                 "createdBy": createdBy,
//                 "relatedBranch": { isDeleted: false }.relatedBranch
//             })
//             var fTransUpdate = await Transaction.findOneAndUpdate(
//                 { _id: fTransResult._id },
//                 {
//                     relatedTransaction: secTransResult._id
//                 },
//                 { new: true }
//             )
//             var amountUpdate = await Accounting.findOneAndUpdate(
//                 { _id: result.relatedTreatment.relatedAccount },
//                 { $inc: { amount: req.body.paidAmount } }
//             )

//             var amountUpdate2 = await Accounting.findOneAndUpdate(
//                 { _id: "6467379159a9bc811d97f4d2" },
//                 { $inc: { amount: -req.body.paidAmount } }
//             )
//         }
//         let response = {
//             success: true,
//             data: result,
//             //appointmentAutoGenerate: appointmentResult,
//             fTransResult: fTransUpdate,
//             // secTransResult: secTransResult,
//             // treatmentVoucherResult:treatmentVoucherResult
//         }
//         if (treatmentVoucherResult) response.treatmentVoucherResult = treatmentVoucherResult;
//         if (rpRecordPopulated) response.rpRecordPopulated = rpRecordPopulated
//         return res.status(200).send(response);
//     } catch (error) {
//         console.log(error)
//         return res.status(500).send({ "error": true, "message": error.message })
//     }
// };

exports.deletePackageSelection = async (req, res, next) => {
    try {
        const result = await PackageSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
};

exports.activatePackageSelection = async (req, res, next) => {
    try {
        const result = await PackageSelection.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.createTreatmentTransaction = async (req, res) => {
    try {
        //first transaction 
        const fTransaction = new Transaction({
            "amount": req.body.amount,
            "date": req.body.date,
            "relatedBranch": req.body.relatedBranch,
            "remark": req.body.remark,
            "relatedAccounting": req.body.firstAccount,
            "type": "Credit",
            "createdBy": createdBy,
            "relatedBranch": { isDeleted: false }.relatedBranch
        })
        const fTransResult = await fTransaction.save()
        const secTransaction = new Transaction(
            {
                "amount": req.body.amount,
                "date": req.body.date,
                "relatedBranch": req.body.relatedBranch,
                "remark": req.body.remark,
                "relatedAccounting": req.body.secondAccount,
                "type": "Debit",
                "relatedTransaction": fTransResult._id,
                "createdBy": createdBy,
                "relatedBranch": { isDeleted: false }.relatedBranch
            }
        )
        var fTransUpdate = await Transaction.findOneAndUpdate(
            { _id: fTransResult._id },
            {
                relatedTransaction: secTransResult._id
            },
            { new: true }
        )
        const secTransResult = await secTransaction.save()
        res.status(200).send({
            message: 'MedicineSale Transaction success',
            success: true,
            fTrans: fTransUpdate,
            sTrans: secTransResult
        });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
}

exports.getRelatedPackageSelections = async (req, res) => {
    try {
        let query = { isDeleted: false };
        let { relatedPatient, start, end, relatedAppointments } = req.body
        if (start && end) query.createdAt = { $gte: start, $lte: end }
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (relatedAppointments) query.relatedAppointments = { $in: relatedAppointments }
        const result = await PackageSelection.find(query).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
        if (result.length === 0)
            return res.status(404).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {

        return res.status(500).send({ error: true, message: 'An Error Occured While Fetching Related Treatment Selections' })
    }
};


exports.searchPackageSelections = async (req, res, next) => {
    try {
        let query = { isDeleted: false }
        let { search, relatedPatient } = req.body
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (search) query.$text = { $search: search }
        const result = await PackageSelection.find(query).populate('createdBy relatedAppointments remainingAppointments relatedTransaction relatedPatient relatedTreatmentList').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'relatedDoctor',
                model: 'Doctors'
            }
        })
        if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
        return res.status(200).send({ success: true, data: result })
    } catch (err) {
        return res.status(500).send({ error: true, message: err.message })
    }
}

// exports.TopTenFilter = async (req, res) => {
//     try {
//         let query = {isDeleted:false}
//         let { start, end } = req.query
//         if (start, end) query.createdAt = { $gte: start, $lte: end }
//         const TreatmentResult = await PackageSelection.find(query).populate('relatedTreatment').populate({
//             path: 'relatedTreatment',
//             populate: [{
//                 path: 'treatmentName',
//                 model: 'TreatmentLists',
//                 // populate:{
//                 //     path:'treatmentName',
//                 //     model:'TreatmentLists'
//                 // }
//             }]
//         })
//         const TreatmentName = [];
//         TreatmentResult.forEach(({ relatedTreatment }) => {
//             const { name, treatmentName } = relatedTreatment;
//             const tempObj = {
//                 treatmentUnit: name,
//                 treatment: treatmentName.name,
//                 qty: 1
//             };
//             TreatmentName.push(tempObj);
//         });
//         const reducedTreatmentNames = TreatmentName.reduce((result, current) => {
//             const existingItem = result.find(item => item.treatmentUnit === current.treatmentUnit);
//             if (existingItem) {
//                 existingItem.qty += current.qty;
//             } else {
//                 result.push(current);
//             }
//             return result;
//         }, []);

//         const sortedTreatmentNames = reducedTreatmentNames.sort((a, b) => b.qty - a.qty); //Descending
//         console.log(sortedTreatmentNames);

//         return res.status(200).send({ success: true, data: sortedTreatmentNames, list: TreatmentResult })
//     } catch (error) {
//         return res.status(500).send({ error: true, message: error.message })
//     }
// }

exports.TopTenFilter = async (req, res) => {
    try {
        let query = { isDeleted: false };
        let { start, end } = req.query;
        if (start, end) query.createdAt = { $gte: start, $lte: end };

        const TreatmentResult = await PackageSelection.find(query)
            .populate('relatedTreatment')
            .populate({
                path: 'relatedTreatment',
                populate: {
                    path: 'treatmentName',
                    model: 'TreatmentLists',
                }
            });

        const treatmentNameMap = TreatmentResult.reduce((result, { relatedTreatment }) => {
            const { name, treatmentName } = relatedTreatment;
            const treatmentUnit = name;
            const treatment = treatmentName.name;

            if (result.hasOwnProperty(treatmentUnit)) {
                result[treatmentUnit].qty++;
            } else {
                result[treatmentUnit] = { treatmentUnit, treatment, qty: 1 };
            }

            return result;
        }, {});

        const reducedTreatmentNames = Object.values(treatmentNameMap);

        const sortedTreatmentNames = reducedTreatmentNames.sort((a, b) => b.qty - a.qty); // Descending

        return res.status(200).send({ success: true, data: sortedTreatmentNames, list: TreatmentResult });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};


// const TreatmentNames = TreatmentResult.reduce((result, { relatedTreatment }) => {
//     const { name, treatmentName } = relatedTreatment;
//     result[name] = (result[name] || 0) + 1; // Increment count by 1
//     return result;
// }, []);
// const sortedTreatmentNames = Object.entries(TreatmentNames)
//     .sort((a, b) => b[1] - a[1])
//     .reduce((sortedObj, [name, count]) => {
//         sortedObj[name] = count;
//         return sortedObj;
//     }, {}); //Descending