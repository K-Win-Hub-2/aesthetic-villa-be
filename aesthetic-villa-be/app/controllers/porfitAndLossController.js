'use strict';
const Log = require('../models/log');
const MedicineSale = require('../models/medicineSale');
const TreatmentVoucher = require('../models/treatmentVoucher');
const Expense = require('../models/expense');
const Income = require('../models/income');
const Currency = require('../models/currency');
const AccountingList = require('../models/accountingList');

exports.getTotal = async (req, res) => {
    try {
        const MSTotal = await MedicineSale.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$totalAmount' // Replace 'totalAmount' with the desired field name
                    }
                }
            }
        ]);

        const pipeline = [
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ];

        const pipeline2 = [
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$amount' } // Replace 'amount' with the desired field name
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentMethod: '$_id',
                    totalAmount: 1
                }
            }
        ];
        const tvPaymentMethod = await TreatmentVoucher.aggregate(pipeline2);
        const msPaymentMethod = await MedicineSale.aggregate(pipeline);

        const TVTotal = await TreatmentVoucher.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$amount' // Replace 'amount' with the desired field name
                    }
                }
            }
        ]);

        const expenseTotal = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$finalAmount' // Replace 'finalAmount' with the desired field name
                    }
                }
            }
        ]);
        let response = {
            msPaymentMethod: msPaymentMethod,
            tvPaymentMethod: tvPaymentMethod
        }
        if (MSTotal.length > 0) response.MSTotal = MSTotal[0].totalAmount
        if (TVTotal.length > 0) response.TVTotal = TVTotal[0].totalAmount
        if (expenseTotal.length > 0) response.expenseTotal = expenseTotal[0].totalAmount
        if (MSTotal.length > 0 && TVTotal.length > 0 && expenseTotal.length > 0) response.profit = MSTotal[0].totalAmount + TVTotal[0].totalAmount - expenseTotal[0].totalAmount
        return res.status(200).send({
            success: true,
            data: response
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: true, message: 'Internal Server Error!' });
    }
};

exports.getTotalWithDateFilter = async (req, res) => {
    try {
        let { start, end, weekName, monthName, createdBy } = req.query
        let query = { ...{ isDeleted: false } }
        let exquery = { ...{ isDeleted: false } }
        let filterQuery = { relatedBankAccount: { $exists: true } }
        let filterQuery2 = { relatedBank: { $exists: true } }
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let startDate, endDate;

        const currencyList = await Currency.find({})

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        // let { weekName, monthName } = req.body;
        // Determine the start and end dates based on the weekName
        if (weekName) {
            switch (weekName) {
                case 'First Week':
                    startDate = new Date(year, month, 1);
                    endDate = new Date(year, month, 7);
                    break;
                case 'Second Week':
                    startDate = new Date(year, month, 8);
                    endDate = new Date(year, month, 14);
                    break;
                case 'Third Week':
                    startDate = new Date(year, month, 15);
                    endDate = new Date(year, month, 21);
                    break;
                case 'Fourth Week':
                    startDate = new Date(year, month, 22);
                    endDate = new Date(year, month, getLastDayOfMonth(year, month));
                    break;
                default:
                    res.status(400).json({ error: 'Invalid week name' });
                    return;
            }
        }

        // Check if the provided month value is valid
        if (monthName && !months.includes(monthName)) {
            return res.status(400).json({ error: 'Invalid month' });
        }

        // Get the start and end dates for the specified month
        const startedDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName), 1));
        const endedDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName) + 1, 1));

        if (start && end) {
            query.createdAt = { $gte: start, $lte: end }
            exquery.date = { $gte: start, $lte: end }
            filterQuery2.date = { $gte: start, $lt: end }
            filterQuery.date = { $gte: start, $lt: end }
        }
        else if (weekName) {
            query.createdAt = { $gte: startDate, $lte: endDate }
            exquery.date = { $gte: startDate, $lte: endDate }
            filterQuery2.date = { $gte: startDate, $lt: endDate }
            filterQuery.date = { $gte: startDate, $lt: endDate }
        }
        else if (monthName) {
            query.createdAt = { $gte: startedDate, $lte: endedDate }
            exquery.date = { $gte: startedDate, $lte: endedDate }
            filterQuery2.date = { $gte: startedDate, $lt: endedDate }
            filterQuery.date = { $gte: startedDate, $lt: endedDate }
        }
        if (createdBy) {
            filterQuery2.createdBy = createdBy
            filterQuery.createdBy = createdBy
        }

        filterQuery2.tsType = 'MS'

        const msFilterBankResult = await TreatmentVoucher.find(filterQuery2).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment relatedBank relatedCash').populate({
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
        filterQuery2.tsType = { $in: ["TS", "TSMulti"] }
        const tvFilterBankResult = await TreatmentVoucher.find(filterQuery2).populate('relatedTreatment relatedAppointment relatedPatient relatedBank relatedCash')
        const incomeFilterBankResult = await Income.find(filterQuery).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        const expenseFilterBankResult = await Expense.find(filterQuery).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        const { relatedBankAccount, ...filterQuerys } = filterQuery;
        filterQuerys.relatedCashAccount = { $exists: true };

        const { relatedBank, ...filterQuery3 } = filterQuery2;
        filterQuery3.relatedCash = { $exists: true };

        const msFilterCashResult = await TreatmentVoucher.find(filterQuery3).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment relatedBank relatedCash').populate({
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
        const tvFilterCashResult = await TreatmentVoucher.find(filterQuery3).populate('relatedTreatment relatedAppointment relatedPatient relatedBank relatedCash')
        const incomeFilterCashResult = await Income.find(filterQuerys).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        const expenseFilterCashResult = await Expense.find(filterQuerys).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        //      Medicine Sale
        const msBankNames = msFilterBankResult.reduce((result, { relatedBank, msPaidAmount }) => {
            const { name } = relatedBank;
            result[name] = (result[name] || 0) + msPaidAmount;
            return result;
        }, {});
        const msCashNames = msFilterCashResult.reduce((result, { relatedCash, msPaidAmount }) => {
            const { name } = relatedCash;
            result[name] = (result[name] || 0) + msPaidAmount;
            return result;
        }, {});
        const msBankTotal = msFilterBankResult.reduce((total, sale) => total + sale.msPaidAmount, 0);
        const msCashTotal = msFilterCashResult.reduce((total, sale) => total + sale.msPaidAmount, 0);

        //TreatmentVoucher
        const tvBankNames = tvFilterBankResult.reduce((result, { relatedBank, paidAmount, totalPaidAmount }) => {
            const { name } = relatedBank;
            result[name] = (result[name] || 0) + paidAmount + totalPaidAmount;
            return result;
        }, {});
        const tvCashNames = tvFilterCashResult.reduce((result, { relatedCash, paidAmount, totalPaidAmount }) => {
            const { name } = relatedCash;
            result[name] = (result[name] || 0) + paidAmount + totalPaidAmount;
            return result;
        }, {});
        const tvBankTotal = tvFilterBankResult.reduce((total, sale) => total + sale.paidAmount + sale.totalPaidAmount, 0);
        const tvCashTotal = tvFilterCashResult.reduce((total, sale) => total + sale.paidAmount + sale.totalPaidAmount, 0);

        //Income
        const incomeBankNames = incomeFilterBankResult.reduce((result, { relatedBankAccount, finalAmount }) => {
            const { name } = relatedBankAccount;
            result[name] = (result[name] || 0) + finalAmount;
            return result;
        }, {});
        const incomeCashNames = incomeFilterCashResult.reduce((result, { relatedCashAccount, finalAmount }) => {
            const { name } = relatedCashAccount;
            result[name] = (result[name] || 0) + finalAmount;
            return result;
        }, {});
        const incomeBankTotal = incomeFilterBankResult.reduce((total, sale) => total + sale.finalAmount, 0);
        const incomeCashTotal = incomeFilterCashResult.reduce((total, sale) => total + sale.finalAmount, 0);

        //Expense
        const expenseBankNames = expenseFilterBankResult.reduce((result, { relatedBankAccount, finalAmount }) => {
            const { name } = relatedBankAccount;
            result[name] = (result[name] || 0) + finalAmount;
            return result;
        }, {});
        const expenseCashNames = expenseFilterCashResult.reduce((result, { relatedCashAccount, finalAmount }) => {
            const { name } = relatedCashAccount;
            result[name] = (result[name] || 0) + finalAmount;
            return result;
        }, {});
        const expenseBankTotal = expenseFilterBankResult.reduce((total, sale) => total + sale.finalAmount, 0);
        const expenseCashTotal = expenseFilterCashResult.reduce((total, sale) => total + sale.finalAmount, 0);

        const MedicineSaleResult = await TreatmentVoucher.find({ isDeleted: false, tsType: 'MS' }).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
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
        const TreatmentVoucherResult = await TreatmentVoucher.find({ isDeleted: false, tsType: { $in: ["TS", "TSMulti"] } }).populate('relatedTreatment relatedAppointment relatedPatient')
        const ExpenseResult = await Expense.find(exquery).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        const IncomeResult = await Income.find(exquery).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        const msTotalAmount = MedicineSaleResult.reduce((total, sale) => total + sale.msPaidAmount, 0);
        const tvTotalAmount = TreatmentVoucherResult.reduce((total, sale) => total + sale.paidAmount + sale.totalPaidAmount, 0);
        const exTotalAmount = ExpenseResult.reduce((total, sale) => {
            let current = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
            let ans = current * sale.finalAmount
            return total + ans
        }, 0);
        const inTotalAmount = IncomeResult.reduce((total, sale) => {
            let cur = currencyList.filter(currency => currency.code === sale.finalCurrency)[0].exchangeRate
            let ans = cur * sale.finalAmount
            return total + ans
        }, 0);

        const tvPaymentMethod = TreatmentVoucherResult.reduce((result, { paymentMethod, paidAmount, totalPaidAmount }) => {
            result[paymentMethod] = (result[paymentMethod] || 0) + paidAmount + totalPaidAmount;
            return result;
        }, {});

        const msPaymentMethod = MedicineSaleResult.reduce((result, { paymentMethod, msPaidAmount }) => {
            result[paymentMethod] = (result[paymentMethod] || 0) + msPaidAmount;
            return result;
        }, {});

        return res.status(200).send({
            succes: true,
            income: {
                bankResult: incomeFilterBankResult,
                cashResult: incomeFilterCashResult,
                BankNames: incomeBankNames,
                CashNames: incomeCashNames,
                BankTotal: incomeBankTotal,
                CashTotal: incomeCashTotal
            },
            expense: {
                bankResult: expenseFilterBankResult,
                cashResult: expenseFilterCashResult,
                BankNames: expenseBankNames,
                CashNames: expenseCashNames,
                BankTotal: expenseBankTotal,
                CashTotal: expenseCashTotal
            },
            medicineSale: {
                bankResult: msFilterBankResult,
                cashResult: msFilterCashResult,
                BankNames: msBankNames,
                CashNames: msCashNames,
                BankTotal: msBankTotal,
                CashTotal: msCashTotal
            },

            treatmentVoucher: {
                bankResult: tvFilterBankResult,
                cashResult: tvFilterCashResult,
                BankNames: tvBankNames,
                CashNames: tvCashNames,
                BankTotal: tvBankTotal,
                CashTotal: tvCashTotal
            },
            msPaymentMethod: msPaymentMethod,
            tvPaymentMethod: tvPaymentMethod,
            MedicineSaleResult: MedicineSaleResult,
            TreatmentVoucherResult: TreatmentVoucherResult,
            ExpenseResult: ExpenseResult,
            IncomeResult: IncomeResult,
            MSTotal: msTotalAmount,
            TVTotal: tvTotalAmount,
            expenseTotal: exTotalAmount,
            incomeTotal: inTotalAmount
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: true, message: 'Internal Server Error!' });
    }
};

exports.getTotalwithBranch = async (req, res) => {
    try {
        const relatedBranchId = { isDeleted: false }.relatedBranch; // Assuming you're passing the relatedBranch ID as a query parameter

        const MSTotal = await MedicineSale.aggregate([
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$totalAmount' // Replace 'totalAmount' with the desired field name
                    }
                }
            }
        ]);

        const pipeline = [
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ];

        const pipeline2 = [
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    totalAmount: { $sum: '$amount' } // Replace 'amount' with the desired field name
                }
            },
            {
                $project: {
                    _id: 0,
                    paymentMethod: '$_id',
                    totalAmount: 1
                }
            }
        ];
        const tvPaymentMethod = await TreatmentVoucher.aggregate(pipeline2);
        const msPaymentMethod = await MedicineSale.aggregate(pipeline);

        const TVTotal = await TreatmentVoucher.aggregate([
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$amount' // Replace 'amount' with the desired field name
                    }
                }
            }
        ]);

        const expenseTotal = await Expense.aggregate([
            {
                $match: {
                    relatedBranch: relatedBranchId // Filter documents by relatedBranch ID
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$finalAmount' // Replace 'finalAmount' with the desired field name
                    }
                }
            }
        ]);
        console.log(MSTotal)
        let data = {
            MSTotal: MSTotal,
            TVTotal: TVTotal,
            expenseTotal: expenseTotal,
            msPaymentMethod: msPaymentMethod,
            tvPaymentMethod: tvPaymentMethod // Access the result from the first element of the array
        }
        if (MSTotal.length > 0 || TVTotal.length > 0 || expenseTotal.length > 0) {
            return res.status(200).send({
                success: true,
                data: data
            });
        }

        return res.status(200).send({
            success: true,
            data: {
                MSTotal: 0,
                TVTotal: 0,
                expenseTotal: 0,
                profit: 0,
                msPaymentMethod: msPaymentMethod,
                tvPaymentMethod: tvPaymentMethod // Access the result from the first element of the array
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: true, message: 'Internal Server Error!' });
    }
};



exports.listAllLog = async (req, res) => {
    try {
        let query = { isDeleted: false }
        let result = await Log.find(query).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine').populate({
            path: 'relatedTreatmentSelection',
            populate: [{
                path: 'relatedTreatment',
                model: 'Treatments'
            }]
        });
        let count = await Log.find(query).count();
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

exports.getDay = async (req, res) => {
    let { startDate, endDate } = req.body
    try {
        let query = { isDeleted: false }
        if (startDate && endDate) query.createdAt = { $gte: startDate, $lte: endDate }
        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
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
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        let query2 = { date: { $gte: startDate, $lte: endDate }, isDeleted: false }
        if ({ isDeleted: false }.relatedBranch) query.relatedBranch = { isDeleted: false }.relatedBranch
        const expenseWeek = await Expense.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

exports.getMonth = async (req, res) => {
    try {
        const { month } = req.body;
        let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        // Check if the provided month value is valid
        if (!months.includes(month)) {
            return res.status(400).json({ error: 'Invalid month' });
        }

        // Get the start and end dates for the specified month
        const startDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month), 1));
        const endDate = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(month) + 1, 1));

        let query = { isDeleted: false }
        if (month) query.createdAt = { $gte: startDate, $lte: endDate }

        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
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
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        let query2 = { date: { $gte: startDate, $lte: endDate }, isDeleted: false }
        if ({ isDeleted: false }.relatedBranch) query.relatedBranch = { isDeleted: false }.relatedBranch
        const expenseWeek = await Expense.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount')
        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

exports.getWeek = async (req, res) => {
    // Get the current month and year
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    let startDate, endDate;
    let { weekName, monthName } = req.body;
    // Determine the start and end dates based on the weekName
    switch (weekName) {
        case 'First Week':
            startDate = new Date(year, month, 1);
            endDate = new Date(year, month, 7);
            break;
        case 'Second Week':
            startDate = new Date(year, month, 8);
            endDate = new Date(year, month, 14);
            break;
        case 'Third Week':
            startDate = new Date(year, month, 15);
            endDate = new Date(year, month, 21);
            break;
        case 'Fourth Week':
            startDate = new Date(year, month, 22);
            endDate = new Date(year, month, getLastDayOfMonth(year, month));
            break;
        default:
            res.status(400).json({ error: 'Invalid week name' });
            return;
    }

    try {
        //preparing query
        let query = { isDeleted: false }
        if (weekName) query.createdAt = { $gte: startDate, $lte: endDate }

        const meidicineSaleWeek = await MedicineSale.find(query).populate('relatedPatient relatedAppointment medicineItems.item_id relatedTreatment').populate({
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
        const treatmentVoucherWeek = await TreatmentVoucher.find(query).populate('relatedTreatment relatedAppointment relatedPatient')
        let query2 = { date: { $gte: startDate, $lte: endDate }, isDeleted: false }
        if ({ isDeleted: false }.relatedBranch) query2.relatedBranch = { isDeleted: false }.relatedBranch
        const expenseWeek = await Expense.find(query2).populate('relatedAccounting relatedBankAccount relatedCashAccount')

        res.status(200).send({
            succes: true,
            data: {
                meidicineSaleWeek: meidicineSaleWeek,
                treatmentVoucherWeek: treatmentVoucherWeek,
                expenseWeek: expenseWeek
            }
        })
    } catch (error) {
        res.status(500).json({ error: true, message: 'Internal Server Error!' });
    }
}

function getLastDayOfMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}