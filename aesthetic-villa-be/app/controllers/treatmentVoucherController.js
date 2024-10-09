'use strict';
const TreatmentVoucher = require('../models/treatmentVoucher');
const MedicineItems = require('../models/medicineItem');
const Transaction = require('../models/transaction');
const Accounting = require('../models/accountingList');
const path = require('path');
const UserUtil = require('../lib/userUtil');
const TreatmentSelection = require('../models/treatmentSelection');
const Attachment = require('../models/attachment');
const Log = require('../models/log');
const Debt = require('../models/debt');
const Doctor = require('../models/doctor');
const Therapist = require('../models/therapist');
const patient = require('../models/patient');
const { default: mongoose } = require('mongoose');
const Comission = require('../models/comission');
const nurse = require('../models/nurse');

exports.deleteMS = async (req, res) => {
    try {
        const result = await TreatmentVoucher.findOneAndUpdate({ _id: req.params.id }, { isDeleted: true }, { new: true })
        return res.status(200).send({ success: true, data: result })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.listAllTreatmentVouchers = async (req, res) => {
    let { keyword, role, limit, skip, tsType } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 20; //limit
        skip = +skip || 0;
        let query = { isDeleted: false },
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        if (tsType) query.tsType = tsType
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient payment relatedTreatmentSelection')
                                                        .populate({
                                                            path: "repay",
                                                            populate :{
                                                            path:"repayId",  
                                                            populate:[
                                                                {
                                                                path: "relatedTreatmentVoucher"
                                                                },
                                                                {
                                                                    path: "relatedPatient"
                                                                },
                                                                {
                                                                    path: "relatedBank"
                                                                },
                                                                {
                                                                    path: "relatedCash"
                                                                },
                                                            ]
                                                            }
                                                            })
        count = await TreatmentVoucher.find(query).count();
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

exports.getTreatmentVoucherWithTreatmentID = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query.relatedTreatmentSelection = req.params.id
    const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient')
                                                    .populate({
                                                        path: "repay",
                                                        populate :{
                                                        path:"repayId",  
                                                        populate:[
                                                            {
                                                            path: "relatedTreatmentVoucher"
                                                            },
                                                            {
                                                            path: "relatedPatient"
                                                            },
                                                            {
                                                            path: "relatedBank"
                                                            },
                                                            {
                                                            path: "relatedCash"
                                                            },
                                                        ]
                                                        }
                                                        })
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getTreatmentVoucher = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query._id = req.params.id
    const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient relatedTreatmentSelection multiTreatment.item_id relatedCash relatedBank relatedDoctor medicineItems.item_id relatedPackageSelection relatedPackage')
                                                     .populate([{
                                                            path: "repay",
                                                            populate :{
                                                            path:"repayId",  
                                                            populate:[
                                                                {
                                                                path: "relatedTreatmentVoucher"
                                                                },
                                                                {
                                                                    path: "relatedPatient"
                                                                },
                                                                {
                                                                    path: "relatedBank"
                                                                },
                                                                {
                                                                    path: "relatedCash"
                                                                },
                                                            ]
                                                            }
                                                            },
                                                            {
                                                                path:"secondAccount",
                                                                populate: [
                                                                    { path:"relatedType"},
                                                                    { path:"relatedHeader"},
                                                                    { path:"relatedTreatment"},
                                                                    { path:"relatedBank"},
                                                                ]
                                                            }                                       
                                                        ])
    if (!result)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};


exports.updateMedicineSale = async (req, res) => {
    try {
        let totalVoucherAmount = 0
        let data = req.body
        let removeItem
        const { tsType, 
            id, 
            secondAccount, 
            relatedCash, 
            relatedBank, 
            msTotalAmount, 
            msPaidAmount,
            relatedPatient,
            medicineItems
             } = req.body;
        relatedBank ? removeItem = { relatedCash: ""} : removeItem = { relatedBank: "", bankType: ""}
             // check secondAmount exit or not
        let secondAmount = req.body.secondAmount ? req.body.secondAmount : 0
        let amount = (msPaidAmount + secondAmount )
        let findVoucherById = await TreatmentVoucher.findById(id)
        let findDebt = await Debt.findOne({relatedTreatmentVoucher:id})

        if (findVoucherById.medicineItems.length> 0) {
            for(let i of findVoucherById.medicineItems) {
                let findItem = await MedicineItems.findById(i.item_id)
                let currentQuantity = findItem.currentQuantity + ( i.qty || 0)
                let totalUnit = ( currentQuantity * Number(findItem.toUnit)) / Number(findItem.fromUnit)
                await MedicineItems.findByIdAndUpdate(findItem._id, { totalUnit: totalUnit, currentQuantity: currentQuantity})
            }
        }
        if(findVoucherById.relatedBank) await Accounting.findByIdAndUpdate(findVoucherById.relatedBank, {$inc: {amount: -findVoucherById.msPaidAmount}})
        if(findVoucherById.relatedCash) await Accounting.findByIdAndUpdate(findVoucherById.relatedCash, {$inc: {amount: -findVoucherById.msPaidAmount}})
        if(findVoucherById.secondAccount) await Accounting.findByIdAndUpdate(findVoucherById.secondAccount, {$inc: { amount: -findVoucherById.secondAmount}})
        //if the voucher is seperated method
        if(req.body.secondAmount || req.body.secondAmount > 0) await TreatmentVoucher.findOneAndUpdate({_id:id}, { $unset: { ...removeItem, secondAccount: "", secondAmount: "", medicineItems: "" }},{ new:true}).populate('createdBy relatedTreatment relatedTherapist relatedAppointment relatedPatient')
        else await TreatmentVoucher.findOneAndUpdate({_id:id}, { $unset: {...removeItem, medicineItems: "" }},{ new:true}).populate('createdBy relatedTreatment relatedTherapist relatedAppointment relatedPatient')
        //firstly check paid amount to subtract different paid amount to patient
        await patient.findByIdAndUpdate(relatedPatient, {$inc: {totalPaidAmount: -(findVoucherById.msPaidAmount + (findVoucherById.secondAmount || 0)), debtBalance: -(findDebt? findDebt.balance: 0)}})
        // for Debt
        let debtAmount = ( msTotalAmount - amount ) 
        // if debtAmount is greater than 0 and there is no debt in database with treatment voucher then create a new one
        if(debtAmount > 0 && !findDebt){
            await Debt.create({
                "relatedPatient" : relatedPatient,
                "balance" : debtAmount,
                "relatedTreatmentVoucher": id
            })
        }
         // if debtAmount is greater than 0  and also have debt , then update the amount
        else if (debtAmount >= 0 && findDebt) {
            await Debt.findOneAndUpdate({relatedTreatmentVoucher:id},{isPaid: debtAmount === 0 ? true : false, balance: debtAmount})  
        }
        // update totalPaidAmount and debtBalance of patient and accounting list account
        await patient.findByIdAndUpdate(relatedPatient, {$inc: {totalAmount: msTotalAmount,totalPaidAmount: amount, debtBalance: debtAmount}})
        if(relatedBank) await Accounting.findByIdAndUpdate(relatedBank, {$inc: {amount: msPaidAmount}})
        if(relatedCash) await Accounting.findByIdAndUpdate(relatedCash, {$inc: {amount: msPaidAmount}})
        if(secondAccount) await Accounting.findByIdAndUpdate(secondAccount, {$inc: { amount: req.body.secondAmount}})
        let updateMedicineSale= await TreatmentVoucher.findOneAndUpdate(
            { _id: id },
            data,
                { new: true },
            ).populate('createdBy relatedTreatment relatedTherapist relatedAppointment relatedPatient')
        
        if (medicineItems.length> 0) {
            for(let i of medicineItems) {
                let findItem = await MedicineItems.findById(i.item_id)
                let currentQuantity = findItem.currentQuantity - ( i.qty || 0)
                let totalUnit = ( currentQuantity * Number(findItem.toUnit)) / Number(findItem.fromUnit)
                await MedicineItems.findByIdAndUpdate(findItem._id, { totalUnit: totalUnit, currentQuantity: currentQuantity})
                }
        }
        let totalVoucher = await TreatmentVoucher.find({relatedPatient: relatedPatient, isDeleted: false, Refund: false})
        for (let i = 0; i < totalVoucher.length; i++) {
            totalVoucherAmount += ( totalVoucher[i].totalAmount || 0 ) + ( totalVoucher[i].msTotalAmount || 0)
        }
        console.log(totalVoucherAmount)
        await patient.findByIdAndUpdate(relatedPatient, {totalAmount: totalVoucherAmount})
        return res.status(200).send({ success: true, data: updateMedicineSale })
    } catch (error) {
        console.log(error)
        return res.status(200).send({ error: true, message: error.message })
    }

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
                console.log(data)
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

exports.getRelatedTreatmentVoucher = async (req, res) => {
    try {
        let { relatedPatient, startDate, endDate, createdBy, bankType, tsType, relatedDoctor, relatedTreatmentSelection } = req.body
        let query = { isDeleted: false };
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (bankType) query.bankType = bankType
        if (createdBy) query.createdBy = createdBy
        if (tsType) query.tsType = tsType
        if (relatedTreatmentSelection) query.relatedTreatmentSelection = relatedTreatmentSelection
        console.log(query, relatedDoctor)
        let result = await TreatmentVoucher.find(query).populate('relatedTreatment relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedAccounting payment createdBy').populate({
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
            path: "repay",
            populate :{
              path:"repayId",  
              populate:[
                {
                 path: "relatedTreatmentVoucher"
                },
                {
                    path: "relatedPatient"
                },
                {
                    path: "relatedBank"
                },
                {
                    path: "relatedCash"
                },
            ]
            }
            })
        if (relatedDoctor) {
            result = result.filter(item => {
                if (item.relatedTreatmentSelection && Array.isArray(item.relatedTreatmentSelection.relatedAppointments)) {
                    const hasMatchingAppointment = item.relatedTreatmentSelection.relatedAppointments.some(
                        i => i.relatedDoctor && i.relatedDoctor._id && i.relatedDoctor._id.toString() === relatedDoctor
                    );
                    console.log(hasMatchingAppointment);
                    return hasMatchingAppointment;
                } else {
                    return false; // Or handle the case when there are no relatedAppointments as needed
                }
            });
        }

        if (!result)
            return res.status(404).json({ error: true, message: 'No Record Found' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: 'An Error Occured While Fetching Related Treatment Vouchers' })
    }
};

exports.searchTreatmentVoucher = async (req, res, next) => {
    try {
        let query = { isDeleted: false }
        let { search, relatedPatient } = req.body
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (search) query.$text = { $search: search }
        const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient relatedTreatmentSelection')
                                                        .populate({
                                                            path: "repay",
                                                            populate :{
                                                            path:"repayId",  
                                                            populate:[
                                                                {
                                                                path: "relatedTreatmentVoucher"
                                                                },
                                                                {
                                                                    path: "relatedPatient"
                                                                },
                                                                {
                                                                    path: "relatedBank"
                                                                },
                                                                {
                                                                    path: "relatedCash"
                                                                },
                                                            ]
                                                            }
                                                            })
        if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' })
        return res.status(200).send({ success: true, data: result })
    } catch (err) {
        return res.status(500).send({ error: true, message: err.message })
    }
}

exports.getCode = async (req, res) => {
    let data = {}
    try {
        let day = new Date().toISOString()
        let today = day.split("T")
        console.log("today",today,  today[0].replace(/-/g,""))
        const latestDocument = await TreatmentVoucher.find({isDeleted: false}).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument.length === 0 ) data = { ...data, seq: 1, code: "TVC-"+ today[0].replace(/-/g,"") + "-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument.length > 0 && latestDocument[0].seq) {
            const increment = latestDocument[0].seq + 1
            data = { ...data, code: "TVC-" + today[0].replace(/-/g,"") + "-" + increment, seq: increment }
        }
        return res.status(200).send({ success: true, data: data })
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
}

exports.getCodeMS = async (req, res) => {
    let data = {}
    try {
        console.log("this si today")
        const latestDocument = await TreatmentVoucher.find({ tsType: 'MS' }, { seq: 1 }).sort({ _id: -1 }).limit(1).exec();
        if (latestDocument.length === 0) data = { ...data, seq: 1, code: "MVC-" + "-1" } // if seq is undefined set initial patientID and seq
        if (latestDocument.length > 0) {
            const increment = ( latestDocument[0].seq || 0) + 1
            data = { ...data, code: "MVC-" + "-" + increment, seq: increment }
        }
        return res.status(200).send({ success: true, data: data })
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
}

exports.createTreatmentVoucher = async (req, res, next) => {
    let data = req.body;
    try {

        const newTreatmentVoucher = new TreatmentVoucher(data);
        const result = await newTreatmentVoucher.save();
        res.status(200).send({
            message: 'TreatmentVoucher create success',
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateTreatmentVoucher = async (req, res, next) => {
    try {
        let totalVoucherAmount = 0
        let data = req.body
        let result
        let removeItem
        const { tsType, 
                multiTreatment, 
                relatedTreatmentSelection, 
                id, 
                secondAccount, 
                relatedCash, 
                relatedBank, 
                totalAmount, 
                totalPaidAmount,
                relatedPatient
                 } = req.body;
       //to remove relatedCash and relatedBank
        relatedBank ? removeItem = { relatedCash: ""} : removeItem = { relatedBank: "", bankType: ""}
        // check secondAmount exit or not
        let secondAmount = req.body.secondAmount ? req.body.secondAmount : 0
        let parsedMulti = JSON.parse(multiTreatment)
       let query= {
        _id: id
        }
        // relatedBank ? query.relatedBank = { $exists: true } : query.relatedCash = { $exists: true }
        // console.log("parse Multi is ", parsedMulti)
        let amount = (totalPaidAmount + secondAmount ) 
        let TSArray = []
        let files = req.files
        let findVoucherById = await TreatmentVoucher.findOne(query)
        let findDebt = await Debt.findOne({relatedTreatmentVoucher:id})
        if (files.payment) {
            for (const element of files.payment) {
                let imgPath = element.path.split('cherry-k')[1];
                const attachData = {
                    fileName: element.originalname,
                    imgUrl: imgPath,
                    image: 'payment'
                };
                const attachResult = await Attachment.create(attachData);
                console.log(attachResult, 'result')
                attachID = attachResult._id
            }
        }
        //check second amount and also first amount and subtract from account in accounting list
        if(findVoucherById.relatedBank) await Accounting.findByIdAndUpdate(findVoucherById.relatedBank, {$inc: {amount: -findVoucherById.totalPaidAmount}})
        if(findVoucherById.relatedCash) await Accounting.findByIdAndUpdate(findVoucherById.relatedCash, {$inc: {amount: -findVoucherById.totalPaidAmount}})
        if(findVoucherById.secondAccount) await Accounting.findByIdAndUpdate(findVoucherById.secondAccount, {$inc: { amount: -findVoucherById.secondAmount}})
        //if the voucher is seperated method
        if(req.body.secondAmount || req.body.secondAmount > 0) await TreatmentVoucher.findOneAndUpdate({_id:id}, { $unset: { ...removeItem, secondAccount: "", secondAmount: "" }},{ new:true}).populate('createdBy relatedTreatment relatedTherapist relatedAppointment relatedPatient')
        else await TreatmentVoucher.findOneAndUpdate({_id:id}, { $unset: removeItem },{ new:true}).populate('createdBy relatedTreatment relatedTherapist relatedAppointment relatedPatient')
        //firstly check paid amount to subtract different paid amount to patient
        await patient.findByIdAndUpdate(relatedPatient, {$inc: {totalPaidAmount: -(findVoucherById.totalPaidAmount + (findVoucherById.secondAmount || 0)), debtBalance: -findDebt.balance}})
        // for Debt
        let debtAmount = ( totalAmount - amount ) 
        // if debtAmount is greater than 0 and there is no debt in database with treatment voucher then create a new one
        if(debtAmount > 0 && !findDebt){
            await Debt.create({
                "relatedPatient" : relatedPatient,
                "balance" : debtAmount,
                "relatedTreatmentVoucher": id
            })
        }
         // if debtAmount is greater than 0  and also have debt , then update the amount
        else if (debtAmount >= 0 && findDebt) {
            await Debt.findOneAndUpdate({relatedTreatmentVoucher:id},{isPaid: debtAmount === 0 ? true : false, balance: debtAmount})  
        }
        // update totalPaidAmount and debtBalance of patient and accounting list account
        await patient.findByIdAndUpdate(relatedPatient, {$inc: {totalAmount: totalAmount,totalPaidAmount: amount, debtBalance: debtAmount}})
        if(relatedBank) await Accounting.findByIdAndUpdate(relatedBank, {$inc: {amount: totalPaidAmount}})
        if(relatedCash) await Accounting.findByIdAndUpdate(relatedCash, {$inc: {amount: totalPaidAmount}})
        if(secondAccount) await Accounting.findByIdAndUpdate(secondAccount, {$inc: { amount: req.body.secondAmount}})
        if (tsType === 'TSMulti') {
            //delete relatedTreatmentSelection form database
            await TreatmentVoucher.findByIdAndUpdate(id,{
                $unset:{
                  relatedTreatmentSelection: ""
             }
            })
            //loop through treatment seleciton and  delete and create
            for (const item of JSON.parse(relatedTreatmentSelection)) {
                await TreatmentSelection.findByIdAndDelete(item).then(res => {
                    console.log(item + ' is Deleted')
                })
            }
            for (const i of parsedMulti) {
                data.multiTreatment = parsedMulti
                data.relatedTreatment = i.item_id
                data.discount = i.discountAmount
                let result = await TreatmentSelection.create(data)
                TSArray.push(result._id)
            }
            await patient.findByIdAndUpdate(relatedPatient,{$push:{relatedTreatmentSelection:{$each: TSArray}}})
            data = { ...data, relatedTreatmentSelection: TSArray }
            data.multiTreatment = parsedMulti
        }
        result = await TreatmentVoucher.findOneAndUpdate(
        { _id: id },
        data,
            { new: true },
        ).populate('createdBy relatedTreatment relatedTherapist relatedAppointment relatedPatient')
        let totalVoucher = await TreatmentVoucher.find({relatedPatient: relatedPatient, isDeleted: false, Refund: false})
        for (let i = 0; i < totalVoucher.length; i++) {
            totalVoucherAmount += ( totalVoucher[i].totalAmount || 0 ) + ( totalVoucher[i].msTotalAmount || 0)
        }
        await patient.findByIdAndUpdate(relatedPatient, {totalAmount: totalVoucherAmount})
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.activateTreatmentVoucher = async (req, res, next) => {
    try {
        const result = await TreatmentVoucher.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.getTodaysTreatmentVoucher = async (req, res) => {
    try {
        let query = { isDeleted: false }
        var start = new Date();
        var end = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (start && end) query.originalDate = { $gte: start, $lt: end }
        const result = await TreatmentVoucher.find(query).populate('createdBy relatedAppointment relatedPatient').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'treatmentName',
                model: 'TreatmentLists'
            }
        }).populate({
            path: "repay",
            populate :{
              path:"repayId",  
              populate:[
                {
                 path: "relatedTreatmentVoucher"
                },
                {
                    path: "relatedPatient"
                },
                {
                    path: "relatedBank"
                },
                {
                    path: "relatedCash"
                },
            ]
            }
            })
        if (result.length === 0) return res.status(404).json({ error: true, message: 'No Record Found!' })
        return res.status(200).send({ success: true, data: result })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.getwithExactDate = async (req, res) => {
    try {
        let { exact } = req.query;
        const date = new Date(exact);
        const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Set start date to the beginning of the day
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // Set end date to the beginning of the next day
        let result = await TreatmentVoucher.find({ createdAt: { $gte: startDate, $lt: endDate } }).populate('createdBy relatedAppointment relatedPatient relatedCash').populate({
            path: 'relatedTreatment',
            model: 'Treatments',
            populate: {
                path: 'treatmentName',
                model: 'TreatmentLists'
            }
        })
        //.populate('createdBy relatedTreatment relatedAppointment relatedPatient');
        if (result.length <= 0) return res.status(404).send({ error: true, message: 'Not Found!' });
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message });
    }
};


exports.TreatmentVoucherFilter = async (req, res) => {
    let BankTotal = 0
    let CashTotal = 0
    let secondBankAndCashAccount = {}
    let secondBankCashAmount = []
    let firstBankName = []
    let firstCashName = []
    let secondCashName=[]
    let query = { relatedBank: { $exists: true }, isDeleted: false }
    let response = {
        success: true,
        data: {}
    }
    try {
        const { income, startDate, endDate, createdBy, purchaseType, relatedDoctor, bankType, tsType, relatedPatient, bankID } = req.query
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (bankType) query.bankType = bankType
        if (createdBy) query.createdBy = createdBy
        if (tsType) query.tsType = tsType
        if (bankID) query.relatedBank = bankID
        if (purchaseType) query.purchaseType = purchaseType
        if (relatedDoctor) query.relatedDoctor = relatedDoctor
        let bankResult = await TreatmentVoucher.find({...query,Refund: false}).populate('newTreatmentVoucherId multiTreatment.item_id medicineItems.item_id relatedTreatment secondAccount relatedDoctor relatedBank relatedCash relatedTreatmentSelection relatedPackage relatedPackageSelection relatedTherapist relatedAccounting payment createdBy')
        .populate({
            path: 'relatedTreatmentSelection',
            populate: [{
                path: 'relatedAppointments',
                populate: {
                    path: 'relatedDoctor',
                    model: 'Doctors'
                }
            },
            {
                path: 'relatedTreatment',
                model: 'Treatments',
            }]
        }).populate({
            path:"secondAccount",
            model:"AccountingLists",
            populate: {
                path:"relatedHeader",
                model:"AccountHeaders"
            }
        }).populate({
            path: "repay",
            populate :{
              path:"repayId",  
              populate:[
                {
                 path: "relatedTreatmentVoucher"
                },
                {
                    path: "relatedPatient"
                },
                {
                    path: "relatedBank"
                },
                {
                    path: "relatedCash"
                },
            ]
            }
            }).populate({
                path:"relatedPatient",
                populate:{
                    path:"relatedTreatmentSelection",
                    populate:{
                        path: "relatedTreatment"
                    }
                }
            })
        let allBankResult = await TreatmentVoucher.find(query).populate('newTreatmentVoucherId multiTreatment.item_id medicineItems.item_id relatedTreatment secondAccount relatedDoctor relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedPackage relatedPackageSelection relatedAccounting payment relatedTherapist createdBy')
        .populate({
            path: 'relatedTreatmentSelection',
            populate: [{
                path: 'relatedAppointments',
                populate: {
                    path: 'relatedDoctor',
                    model: 'Doctors'
                }
            },
            {
                path: 'relatedTreatment',
                model: 'Treatments',
            }]
        }).populate({
            path:"secondAccount",
            model:"AccountingLists",
            populate: {
                path:"relatedHeader",
                model:"AccountHeaders"
            }
        }).populate({
            path: "repay",
            populate :{
              path:"repayId",  
              populate:[
                {
                 path: "relatedTreatmentVoucher"
                },
                {
                    path: "relatedPatient"
                },
                {
                    path: "relatedBank"
                },
                {
                    path: "relatedCash"
                },
            ]
            }
            }).populate({
                path:"relatedPatient",
                populate:{
                    path:"relatedTreatmentSelection",
                    populate:{
                        path: "relatedTreatment"
                    }
                }
            })  
        if (!bankID) {
            const { relatedBank, ...query2 } = query;
            query2.relatedCash = { $exists: true };
            let cashResult = await TreatmentVoucher.find({...query2,Refund: false}).populate('newTreatmentVoucherId multiTreatment.item_id medicineItems.item_id relatedTreatment relatedDoctor relatedBank relatedCash relatedPatient relatedTreatmentSelection relatedTherapist relatedPackage relatedPackageSelection relatedAccounting payment createdBy')
            .populate({
                path: 'relatedTreatmentSelection',
                populate: [{
                    path: 'relatedAppointments',
                    populate: {
                        path: 'relatedDoctor',
                        model: 'Doctors'
                    }
                },
                {
                    path: 'relatedTreatment',
                    model: 'Treatments',
                }]
            }).populate({
                path:"secondAccount",
                model:"AccountingLists",
                populate: {
                    path:"relatedHeader",
                    model:"AccountHeaders"
                }
            }).populate({
                path: "repay",
                populate :{
                  path:"repayId",  
                  populate:[
                    {
                     path: "relatedTreatmentVoucher"
                    },
                    {
                        path: "relatedPatient"
                    },
                    {
                        path: "relatedBank"
                    },
                    {
                        path: "relatedCash"
                    },
                ]
                }
                }).populate({
                    path:"relatedPatient",
                    populate:{
                        path:"relatedTreatmentSelection",
                        populate:{
                            path: "relatedTreatment"
                        }
                    }
                })
            let allCashResult = await TreatmentVoucher.find(query2).populate('newTreatmentVoucherId multiTreatment.item_id medicineItems.item_id relatedTreatment relatedDoctor relatedBank relatedTherapist relatedCash relatedPatient relatedTreatmentSelection relatedPackage relatedPackageSelection relatedAccounting payment createdBy')
            .populate({
                path: 'relatedTreatmentSelection',
                populate: [{
                    path: 'relatedAppointments',
                    populate: {
                        path: 'relatedDoctor',
                        model: 'Doctors'
                    }
                },
                {
                    path: 'relatedTreatment',
                    model: 'Treatments',
                }]
            }).populate({
                path:"secondAccount",
                model:"AccountingLists",
                populate: {
                    path:"relatedHeader",
                    model:"AccountHeaders"
                }
            }).populate({
                path: "repay",
                populate :{
                  path:"repayId",  
                  populate:[
                    {
                     path: "relatedTreatmentVoucher"
                    },
                    {
                        path: "relatedPatient"
                    },
                    {
                        path: "relatedBank"
                    },
                    {
                        path: "relatedCash"
                    },
                ]
                }
                }).populate({
                    path:"relatedPatient",
                    populate:{
                        path:"relatedTreatmentSelection",
                        populate:{
                            path: "relatedTreatment"
                        }
                    }
                })
            const CashNames = cashResult.reduce((result, { relatedCash, paidAmount, msPaidAmount, totalPaidAmount, psPaidAmount, secondAccount,secondAmount }) => {
                if(secondAccount && secondAccount.relatedHeader.name === "Cash at Bank" ){
                    const bankName =secondAccount.name;
                    secondBankCashAmount.push({bankname:bankName,amount:secondAmount})                
                } 
               
                if (relatedCash) {
                    const { name } = relatedCash;
                    result[name] = (result[name] || 0) + (paidAmount || 0) + (msPaidAmount || 0) + (totalPaidAmount || 0) + (psPaidAmount || 0);
                }
                return result;
            }, {});
            if(CashNames) {
                Object.keys(CashNames).forEach(key=> firstCashName.push({cashname:key, amount:CashNames[key]}) )    
            }
            const CashTotal = cashResult.reduce((total, sale) => total + (sale.paidAmount || 0) + (sale.msPaidAmount || 0) + (sale.totalPaidAmount || 0) + (sale.psPaidAmount || 0), 0);
            income ?  response.data = { ...response.data, CashNames: CashNames, CashTotal: CashTotal }
             : response.data = { ...response.data, CashList: allCashResult, CashNames: CashNames, CashTotal: CashTotal }
        }
        //filter solid beauty
        const BankNames = bankResult.reduce((result, { relatedBank, paidAmount, msPaidAmount, totalPaidAmount, psPaidAmount, secondAccount,secondAmount  }) => {
            
            if(secondAccount && secondAccount.relatedHeader.name == "Cash in Hand"){
                let {name} = secondAccount;
                secondCashName.push({cashname:name, amount:secondAmount})
            }
            else  if(secondAccount && secondAccount.relatedHeader.name === "Cash at Bank" ){
                const bankName =secondAccount.name;
                secondBankCashAmount.push({bankname:bankName,amount:secondAmount})                
            } 
            
            if (relatedBank) {
                const { name } = relatedBank;
                result[name] = (result[name] || 0) + (paidAmount || 0) + (msPaidAmount || 0) + (totalPaidAmount || 0) + (psPaidAmount || 0);
            } return result;

        }, {});   
        let secondBank = secondBankCashAmount.reduce((result, nextresult) => {
            const equalBankName = result.find(t => t.bankname === nextresult.bankname);
     
           if (equalBankName) {
               equalBankName.amount += nextresult.amount;
           } else {
           result.push({ bankname: nextresult.bankname, amount: nextresult.amount });
          }
     
            return result;
            }, []);
            if(BankNames){
                Object.keys(BankNames).forEach(key=> firstBankName.push({bankname:key, amount:BankNames[key]}) )    
            }
          firstBankName.map(data=>{
            BankTotal += (data.amount) || 0
          })
          secondBank.map(data=>{
            BankTotal += (data.amount) || 0
          })
          firstCashName.map(data=>{
            CashTotal += (data.amount) || 0
          })
          secondCashName.map(data=>{
            CashTotal += (data.amount) || 0
          })
          response.data.CashTotal = CashTotal
          income ? response.data = { ...response.data,...secondBankAndCashAccount, firstBankNames:firstBankName, firstCashNames:firstCashName, secondBankNames:secondBank, secondCashNames:secondCashName, BankTotal: BankTotal,}
          :
           response.data = { ...response.data,...secondBankAndCashAccount, BankList: allBankResult, firstBankNames:firstBankName, firstCashNames:firstCashName, secondBankNames:secondBank, secondCashNames:secondCashName, BankTotal: BankTotal,}
        return res.status(200).send(response);
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: error.message })
    }
}
exports.filterTreatmentVoucher = async (req, res, next) => {
    try {
        let query = { isDeleted: false }
        let { startDate, endDate, relatedDoctor, relatedPatient } = req.query
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        if (relatedDoctor) query.relatedDoctor = relatedDoctor
        if (relatedPatient) query.relatedPatient = relatedPatient
        if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
        const result = await TreatmentVoucher.find(query).populate('createdBy relatedTreatment relatedAppointment relatedPatient payment relatedTreatmentSelection ')
        if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
        res.status(200).send({ success: true, data: result })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ error: true, message: err.message })
    }
}

exports.createSingleMedicineSale = async (req, res) => {
    console.log('here')
    console.log(req.body)
    let data = req.body;
    let { remark, relatedBank, relatedCash, totalAmount , msTotalAmount, msBalance, msPaidAmount, medicineItems, balance, relatedPatient, secondAmount, secondAccount } = req.body;
    let createdBy = req.credentials.id;
    let day = new Date().toISOString()
    let today = day.split("T")
    const latestDocument = await TreatmentVoucher.find({isDeleted: false, tsType: "MS"}).sort({ _id: -1 }).limit(1).exec();
    if (latestDocument.length === 0 ) {
        req.body["code"] =  "MVC-"+ today[0].replace(/-/g,"") + "-1"  // if seq is undefined set initial patientID and seq
        req.body["seq"] = 1
    }
    if (latestDocument.length > 0 && latestDocument[0].seq) {
        const increment = latestDocument[0].seq + 1
        req.body["code"] =  "MVC-"+ today[0].replace(/-/g,"") + "-" + increment  // if seq is undefined set initial patientID and seq
        req.body["seq"] = increment 
    }
    console.log("data is "+ JSON.stringify(data))
    if (medicineItems !== undefined) {
        for (const e of medicineItems) {
            const result = await MedicineItems.find({ _id: e.item_id })
            let totalUnit = result[0].totalUnit - e.qty
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
                "createdBy": createdBy
            })
        }
    }
    //_________COGS___________
    const medicineResult = await MedicineItems.find({ _id: { $in: medicineItems.map(item => item.item_id) } })
    const purchaseTotal = medicineResult.reduce((accumulator, currentValue) => accumulator + currentValue.purchasePrice, 0)



    const inventoryResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e06755a87deaea39e17b", //Medicine inventory
        "type": "Credit",
        "createdBy": createdBy
    })
    var inventoryAmountUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e06755a87deaea39e17b" },  // Medicine inventory
        { $inc: { amount: -purchaseTotal } }
    )
    const COGSResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e10b55a87deaea39e193", //Medicine Sales COGS
        "type": "Debit",
        "relatedTransaction": inventoryResult._id,
        "createdBy": createdBy
    })
    var inventoryUpdate = await Transaction.findOneAndUpdate(
        { _id: inventoryResult._id },
        {
            relatedTransaction: COGSResult._id
        },
        { new: true }
    )
    var COGSUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e10b55a87deaea39e193" },  //Medicine Sales COGS
        { $inc: { amount: purchaseTotal } }
    )
    //_________END_OF_COGS___________

    //..........Transaction.............................
    const fTransaction = new Transaction({
        "amount": data.msPaidAmount,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "648095b57d7e4357442aa457", //Sales Medicines
        "type": "Credit",
        "createdBy": createdBy
    })
    const fTransResult = await fTransaction.save()
    //sec transaction
    const secTransaction = new Transaction(
        {
            "amount": data.msPaidAmount,
            "date": Date.now(),
            "remark": remark,
            "relatedBank": relatedBank,
            "relatedCash": relatedCash,
            "type": "Debit",
            "relatedTransaction": fTransResult._id,
            "createdBy": createdBy
        }
    )
    const secTransResult = await secTransaction.save();
    var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
            relatedTransaction: secTransResult._id
        },
        { new: true }
    )
    if (relatedBank) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedBank },
            { $inc: { amount: data.msPaidAmount } }
        )
    } else if (relatedCash) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedCash },
            { $inc: { amount: data.msPaidAmount } }
        )
    }
    if(secondAccount){
        await Accounting.findOneAndUpdate(
            { _id: secondAccount },
            { $inc: { amount: secondAmount } }
        )
    }
    let objID = ''
    if (relatedBank) objID = relatedBank
    if (relatedCash) objID = relatedCash
    //transaction
    const acc = await Accounting.find({ _id: objID })
    if (acc.length > 0) {
        const accResult = await Accounting.findOneAndUpdate(
            { _id: objID },
            { amount: data.msPaidAmount + parseInt(acc[0].amount) },
            { new: true },
        )
    }

    data = { ...data, relatedTransaction: [fTransResult._id, secTransResult._id], createdBy: createdBy, purchaseTotal: purchaseTotal }
    if (purchaseTotal) data.purchaseTotal = purchaseTotal


    //..........END OF TRANSACTION.....................
    console.log(data)
    const newMedicineSale = new TreatmentVoucher(data)
    const medicineSaleResult = await newMedicineSale.save()
    if (req.body.msBalance) {
        const debtCreate = await Debt.create({
            "balance": req.body.msBalance,
            "relatedPatient": data.relatedPatient,
            "relatedTreatmentVoucher": medicineSaleResult._id
        })
        
    }
    if (balance){
        console.log("this is balance ",balance)
    }
    await patient.findByIdAndUpdate(relatedPatient,{$inc: {totalAmount: msTotalAmount, totalPaidAmount: msPaidAmount + (secondAmount || 0), debtBalance: (msBalance || 0)}})
    res.status(200).send({
        message: 'MedicineSale Transaction success',
        success: true,
        data: medicineSaleResult
    });

}

exports.combineMedicineSale = async (req, res) => {
    let data = req.body;
    let { remark, relatedBank, relatedCash, msPaidAmount, medicineItems, id } = req.body;
    let createdBy = req.credentials.id;
    if (medicineItems !== undefined) {
        for (const e of medicineItems) {
            const result = await MedicineItems.find({ _id: e.item_id })
            let totalUnit = result[0].totalUnit - e.qty
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
                "createdBy": createdBy
            })
        }
    }
    if (req.body.msBalance) {
        const debtCreate = await Debt.create({
            "balance": req.body.msBalance,
            "relatedPatient": data.relatedPatient,
            "relatedTreatmentVoucher": treatmentVoucherResult._id
        })
        var updateDebt = await patient.findOneAndUpdate({ _id: relatedPatient }, { $inc: { debtBalance: req.body.msBalance } })

    }
    //_________COGS___________
    const medicineResult = await MedicineItems.find({ _id: { $in: medicineItems.map(item => item.item_id) } })
    const purchaseTotal = medicineResult.reduce((accumulator, currentValue) => accumulator + currentValue.purchasePrice, 0)

    const inventoryResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e06755a87deaea39e17b", //Medicine inventory
        "type": "Credit",
        "createdBy": createdBy
    })
    var inventoryAmountUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e06755a87deaea39e17b" },  // Medicine inventory
        { $inc: { amount: -purchaseTotal } }
    )
    const COGSResult = Transaction.create({
        "amount": purchaseTotal,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "64a8e10b55a87deaea39e193", //Medicine Sales COGS
        "type": "Debit",
        "relatedTransaction": inventoryResult._id,
        "createdBy": createdBy
    })
    var inventoryUpdate = await Transaction.findOneAndUpdate(
        { _id: inventoryResult._id },
        {
            relatedTransaction: COGSResult._id
        },
        { new: true }
    )
    var COGSUpdate = await Accounting.findOneAndUpdate(
        { _id: "64a8e10b55a87deaea39e193" },  //Medicine Sales COGS
        { $inc: { amount: purchaseTotal } }
    )
    //_________END_OF_COGS___________

    //..........Transaction.............................
    const fTransaction = new Transaction({
        "amount": data.msPaidAmount,
        "date": Date.now(),
        "remark": remark,
        "relatedAccounting": "648095b57d7e4357442aa457", //Sales Medicines
        "type": "Credit",
        "createdBy": createdBy
    })
    const fTransResult = await fTransaction.save()
    var amountUpdate = await Accounting.findOneAndUpdate(
        { _id: "648095b57d7e4357442aa457" },  //Sales Medicines
        { $inc: { amount: data.msPaidAmount } }
    )
    //sec transaction
    const secTransaction = new Transaction(
        {
            "amount": data.msPaidAmount,
            "date": Date.now(),
            "remark": remark,
            "relatedBank": relatedBank,
            "relatedCash": relatedCash,
            "type": "Debit",
            "relatedTransaction": fTransResult._id,
            "createdBy": createdBy
        }
    )
    const secTransResult = await secTransaction.save();
    var fTransUpdate = await Transaction.findOneAndUpdate(
        { _id: fTransResult._id },
        {
            relatedTransaction: secTransResult._id
        },
        { new: true }
    )
    if (relatedBank) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedBank },
            { $inc: { amount: data.msPaidAmount } }
        )
    } else if (relatedCash) {
        var amountUpdate = await Accounting.findOneAndUpdate(
            { _id: relatedCash },
            { $inc: { amount: data.msPaidAmount } }
        )
    }
    let objID = ''
    if (relatedBank) objID = relatedBank
    if (relatedCash) objID = relatedCash
    //transaction
    const acc = await Accounting.find({ _id: objID })
    if (acc.length > 0) {
        const accResult = await Accounting.findOneAndUpdate(
            { _id: objID },
            { amount: parseInt(msPaidAmount) + parseInt(acc[0].amount) },
            { new: true },
        )
    }
    data = { ...data, relatedTransaction: [fTransResult._id, secTransResult._id], createdBy: createdBy, purchaseTotal: purchaseTotal }
    if (purchaseTotal) data.purchaseTotal = purchaseTotal
    //..........END OF TRANSACTION.....................

    const medicineSaleResult = await TreatmentVoucher.findOneAndUpdate(
        { _id: id },
        data,
        { new: true }
    )
    if (req.body.msBalance) {
        const debtCreate = await Debt.create({
            "balance": req.body.msBalance,
            "relatedPatient": data.relatedPatient,
            "relatedTreatmentVoucher": medicineSaleResult._id
        })
    }
    res.status(200).send({
        message: 'MedicineSale Combination success',
        success: true,
        data: medicineSaleResult
    });

}

//get treatment voucher by doctor id
exports.getAppointByDoctorId = async (req,res)=>{
     let findDoctorOrTherapist,
         commissionResult 
     let { name, code, isDoctor, excel, isNurse, startDate, endDate } = req.body;
     let query = { isDeleted:false, name:name, code: code};
     if(isDoctor){
        let queryComission = {}
        if(name && code){
            findDoctorOrTherapist = await Doctor.findOne(query).select("-code")
            queryComission.relatedDoctor =  findDoctorOrTherapist._id
        }
        else if(excel){
            queryComission.relatedDoctor = { $exists: true }
        }
        commissionResult = await Comission.find(queryComission)
                                 .populate("relatedTherapist relatedAppointment relatedDoctor")
                                 .populate({
                                    path: "relatedTreatmentVoucher",
                                    populate:[{
                                        path: "relatedPatient"
                                    }]
                                  })
                                 .populate({
                                    path:"relatedAppointment",
                                    populate:[{
                                        path: "relatedPatient"
                                        },
                                        {
                                        path: "relatedTreatmentSelection"
                                        },{
                                        path: "relatedTreatment"
                                    }]
                                 })
     }
     else if(isNurse){
        let queryComission = {}
        if(name && code){
            findDoctorOrTherapist = await nurse.findOne(query).select("-code"); 
            queryComission.relatedNurse =  findDoctorOrTherapist._id
        }
        else if(excel){
            queryComission.relatedNurse = { $exists: true }
        }
        commissionResult = await Comission.find(queryComission)
                                 .populate("relatedTherapist relatedAppointment relatedDoctor")
                                 .populate({
                                    path: "relatedTreatmentVoucher",
                                    populate:[{
                                        path: "relatedPatient"
                                    }]
                                  })
                                 .populate({
                                    path:"relatedAppointment",
                                    populate:[{
                                        path: "relatedPatient"
                                        },{
                                        path: "relatedTreatmentSelection"
                                    },{
                                        path: "relatedTreatment"
                                    }]
                                 })
     }
     else{
        let queryComission = {}
        if(name && code){
            findDoctorOrTherapist = await Therapist.findOne(query).select("-code"); 
            queryComission.relatedTherapist =  findDoctorOrTherapist._id
        }
        else if(excel){
            queryComission.relatedTherapist = { $exists: true }
        }
        commissionResult = await Comission.find(queryComission)
                                 .populate("relatedTherapist relatedDoctor")
                                 .populate({
                                    path: "relatedTreatmentVoucher",
                                    populate:[{
                                        path: "relatedPatient"
                                    }]
                                  }) 
                                 .populate({
                                    path:"relatedAppointment",
                                    populate:[{
                                        path: "relatedPatient"
                                        },{
                                        path: "relatedTreatmentSelection"
                                    },{
                                        path: "relatedTreatment"
                                    }]
                                 })
    
     }
     return res.status(200).send({
        success: true,
        data: commissionResult,
        person: findDoctorOrTherapist || null
     })
}

exports.deleteTreatmentVoucher = async (req,res,next) => {
    let { id } = req.params
    await TreatmentVoucher.findByIdAndUpdate(id, { isDeleted : true });
    return res.status(200).send({success: true, message: "Successfully Deleted "})
}