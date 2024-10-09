'use strict';
const notes = require('../models/notes');
const Note = require('../models/notes');
const Transaction = require('../models/transaction')
const getNetAmount = require('../lib/userUtil').getNetAmount
const getTotal = require('../lib/userUtil').getTotal
const getClosingLastDay = require('../lib/userUtil').getClosingLastDay

exports.listAllNotes = async (req, res) => {
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
        let result = await Note.find(query)
        count = await Note.find(query).count();
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

exports.getNote = async (req, res) => {
    let query = { isDeleted: false }
    if (req.params.id) query._id = req.params.id
    const result = await Note.find(query).populate('item.relatedAccount secondaryItem.relatedAccount')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createNote = async (req, res, next) => {
    let newBody = req.body;
    try {
        const newNote = new Note(newBody);
        const result = await newNote.save();
        res.status(200).send({
            message: 'Note create success',
            success: true,
            data: result
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateNote = async (req, res, next) => {
    try {
        const result = await Note.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        )
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteNote = async (req, res, next) => {
    try {
        const result = await Note.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

const getLastDayOfMonth = (year, month) => {
    const firstDayOfNextMonth = new Date(Date.UTC(year, month + 1, 1))
    const lastDayOfMonth = new Date(firstDayOfNextMonth.getTime() - 1)
    return lastDayOfMonth
}

exports.getNotesByAccounts = async (req, res) => {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let { notesID, monthName } = req.query
    let [clinicTable, surgeryTable] = [[], []]
    let start = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName), 1));
    let end = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName) + 1, 1))
    const yearToQuery = new Date().getFullYear()
    const monthIndex = months.indexOf(monthName)
    const lastDayOfMonth = getLastDayOfMonth(yearToQuery, monthIndex)
    console.log(start, end)
    // Add 1 day to lastDayOfMonth to include documents created on that day
    const nextDay = new Date(lastDayOfMonth)
    nextDay.setDate(nextDay.getDate() + 1)

    const startDate = new Date(yearToQuery, monthIndex, 1);
    const endDate = new Date(yearToQuery, monthIndex, new Date(yearToQuery, monthIndex + 1, 0).getDate());
    try {
        const result = await Note.find({ _id: notesID }).populate('item.relatedAccount secondaryItem.relatedAccount')
        // console.log(result[0].item)
        if (result[0].type === 'income') {
            for (const item of result[0].item) {
                const res = await getNetAmount(item.relatedAccount._id, start, end)
                clinicTable.push({ amount: Math.abs(res), operator: item.operator, name: item.relatedAccount.name })
            }
            for (const item of result[0].secondaryItem) {
                const res = await getNetAmount(item.relatedAccount._id, start, end)
                surgeryTable.push({ amount: Math.abs(res), operator: item.operator, name: item.relatedAccount.name })
            }
        } else if (result[0].type === 'balance') {
            console.log('here')
            for (const item of result[0].item) {
                const res = await getClosingLastDay(item.relatedAccount._id, startDate, endDate)
                clinicTable.push({ amount: Math.abs(res), operator: item.operator, name: item.relatedAccount.name })
            }
            for (const item of result[0].secondaryItem) {
                const res = await getClosingLastDay(item.relatedAccount._id, startDate, endDate)
                surgeryTable.push({ amount: Math.abs(res), operator: item.operator, name: item.relatedAccount.name })
            }
        }
        const clinicTotal = await getTotal(clinicTable)
        const surgeryTotal = await getTotal(surgeryTable)
        return res.status(200).send({
            success: true,
            data: {
                clinicTable: clinicTable,
                clinicTotal: clinicTotal,
                surgeryTable: surgeryTable,
                surgeryTotal: surgeryTotal,
                notesName: result[0].name,
                month: monthName ? monthName : lastDayOfMonth.getMonth()
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: true, message: error.message })
    }
}

exports.activateNote = async (req, res, next) => {
    try {
        const result = await Note.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
