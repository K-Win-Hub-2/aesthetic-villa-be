'use strict';
const Comission = require('../models/comission');
const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const ComissionPay = require('../models/commissionPay');
const { ObjectId } = require('mongodb');
const Nurse = require('../models/nurse');
const Therapist = require('../models/therapist');
const treatmentVoucher = require('../models/treatmentVoucher');

exports.listAllComissiones = async (req, res) => {
    let { keyword, role, limit, skip, relatedDoctor, relatedTherapist, relatedNurse } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = {isDeleted: false},
            regexKeyword;
        relatedDoctor ? query["relatedDoctor"] = relatedDoctor : ""
        relatedTherapist ? query["relatedTherapist"] = relatedTherapist : ""
        relatedNurse ? query["relatedNurse"] = relatedNurse : ""
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await Comission.find(query).populate("relatedDoctor relatedTherapist relatedNurse").populate({
            path: "relatedAppointment",
            populate:{
                path: "relatedTreatmentSelection",
                populate: [{
                    path: "relatedTreatment"
                },
                {
                    path: "relatedPatient"
                }
            ]
            }
        })
        count = await Comission.find(query).count();
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

exports.getComission = async (req, res) => {
    const result = await Comission.find({ _id: req.params.id, isDeleted: false }).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedComission')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.getComissionHistory = async (req, res, next) => {
    try {
        const { month, doctor, nurse, therapist } = req.query;
        if (month) {
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            //Check if the provided month value is valid
            if (!months.includes(month)) {
                return res.status(400).json({ error: 'Invalid month' });
            }
            // Get the start and end dates for the specified month
            var startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month), 1));
            var endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month) + 1, 1));
        } else {
            var { startDate, endDate } = req.query;
        }
        console.log(startDate, endDate)
        const query = { status: 'Claimed' }
        if (startDate & endDate) query.date = { $gte: startDate, $lte: endDate }
        if (doctor) query.relatedDoctor = doctor
        if (nurse) query.relatedNurse = nurse
        if (therapist) query.relatedTherapist = therapist
        const history = await Comission.find(query).populate('relatedDoctor relatedTherapist relatedNurse relatedAppointment').populate({
            path: 'relatedTreatmentSelection',
            model: 'TreatmentSelections',
            populate: {
                path: 'relatedTreatment',
                model: 'Treatments'
            }
        })
        const previousAmount = history.reduce((accumulator, item) => accumulator + item.commissionAmount, 0)
        return res.status(200).send({
            success: true, data: {
                previousAmount: previousAmount,
                history: history
            }
        })
    } catch (error) {
        return res.status(500).send({
            error: true, message: error.message
        })
    }
}

exports.createComission = async (req, res, next) => {
    const { doctorID, appointmentID, nurseID, therapistID, therapistCommissionAmount, isClosed, VoucherCode } = req.body;
    let percent = 0.02
    let comission
    let appointmentResult = await Appointment.find({ _id: appointmentID })
    if (appointmentResult[0].isCommissioned === true) return res.status(500).send({ error: true, message: 'Already Commissioned!' })
    
    doctorID || nurseID ? comission = (req.body.totalAmount / req.body.treatmentTimes) * percent
     : comission = therapistCommissionAmount
     console.log("commission is ",comission, therapistCommissionAmount,req.body)
    if (doctorID) {
        const doctorUpdate = await Doctor.findOneAndUpdate(
            { _id: doctorID },
            { commissionAmount: comission }
        )
    } else if (nurseID) {
        const nurseUpdate = await Nurse.findOneAndUpdate({ _id: nurseID }, { commissionAmount: comission })
    } else if (therapistID) {
        const therapistUpdate = await Therapist.findOneAndUpdate({ _id: therapistID }, { commissionAmount: comission })
    }
    if(isClosed){
        let appointmentUpdate = await Appointment.findOneAndUpdate(
            { _id: req.body.appointmentID },
            { isCommissioned: true }
    )}
    let newBody = req.body;
    try {
        const voucherResult = await treatmentVoucher.findOne({code: VoucherCode})
        console.log("commission is ",comission, therapistCommissionAmount,req.body,voucherResult)
        const newComission = new Comission(newBody);
        const result = await Comission.create({
            relatedAppointment: req.body.appointmentID,
            appointmentAmount: req.body.totalAmount / req.body.treatmentTimes,
            commissionAmount: comission,
            relatedDoctor: req.body.doctorID,
            percent: percent,
            relatedTreatmentSelection: req.body.treatmentSelectId,
            relatedNurse: nurseID,
            relatedTreatmentVoucher: voucherResult._id,
            relatedTherapist: therapistID
        });
        const updateRelatedAppointmentComission = await Appointment.findByIdAndUpdate(
            req.body.appointmentID, {
                $inc:{
                    commissionAmount: comission
                }
            }
        )
        res.status(200).send({
            message: 'Comission create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('procedureMedicine.item_id medicineLists.item_id procedureAccessory.item_id relatedComission')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateComission = async (req, res, next) => {
    try {
        const result = await Comission.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.searchCommission = async (req, res) => {
    let total = 0
    try {
        const { month, doctor, nurse, therapist } = req.query;
        if (month) {
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            //Check if the provided month value is valid
            if (!months.includes(month)) {
                return res.status(400).json({ error: 'Invalid month' });
            }
            // Get the start and end dates for the specified month
            var startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month), 1));
            var endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month) + 1, 1));
        } else {
            var { startDate, endDate } = req.query;
        }
        console.log(startDate, endDate)
        let query = { status: 'Unclaimed' }
        if (month) query.date = { $gte: startDate, $lte: endDate }
        if (doctor) query.relatedDoctor = doctor
        if (nurse) query.relatedNurse = nurse
        if (therapist) query.relatedTherapist = therapist
        const result = await Comission.find(query).populate('relatedDoctor relatedTherapist relatedNurse relatedAppointment')
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
        let { update, startDate, endDate, collectAmount, remark, relatedDoctor, relatedNurse, relatedTherapist, collectDate } = req.body
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
            relatedDoctor: relatedDoctor,
            relatedNurse: relatedNurse,
            relatedTherapist: relatedTherapist,
            relatedCommissions: objectIds,
            collectDate: collectDate
        })
        return res.status(200).send({ success: true, updateResult: updateResult, comissionPayResult: cPayResult })
    } catch (e) {
        return res.status(500).send({ error: true, message: e.message });
    }
}
