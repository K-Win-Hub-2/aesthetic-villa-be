'use strict';
const Transaction = require('../models/transaction');
const AccountingList = require('../models/accountingList');
const Note = require('../models/notes');
const getNetAmount = require('../lib/userUtil').getNetAmount
const getTotal = require('../lib/userUtil').getTotal
const Income = require('../models/income');
const Expense = require('../models/expense');
const getClosingLastDay = require('../lib/userUtil').getClosingLastDay

const getLastDayOfMonth = (year, month) => {
  const firstDayOfNextMonth = new Date(Date.UTC(year, month + 1, 1))
  const lastDayOfMonth = new Date(firstDayOfNextMonth.getTime() - 1)
  return lastDayOfMonth
}

// exports.getBalanceSheet = async (req, res) => {
//   const finalResult = {}
//   const months = [
//     'Jan',
//     'Feb',
//     'Mar',
//     'Apr',
//     'May',
//     'Jun',
//     'Jul',
//     'Aug',
//     'Sep',
//     'Oct',
//     'Nov',
//     'Dec'
//   ]

//   const noteResult = await Note.find({ isDeleted: false, type: 'balance' })
//   console.log(noteResult)
//   for (const element of noteResult) {
//     const totalArray = []

//     for (const monthName of months) {
//       const yearToQuery = new Date().getFullYear()
//       const monthIndex = months.indexOf(monthName)
//       const lastDayOfMonth = getLastDayOfMonth(yearToQuery, monthIndex)

//       // Add 1 day to lastDayOfMonth to include documents created on that day
//       const nextDay = new Date(lastDayOfMonth)
//       nextDay.setDate(nextDay.getDate() + 1)

//       const result = await Note.find({
//         _id: element._id
//       }).populate('item.relatedAccount secondaryItem.relatedAccount')

//       const [clinicTable, surgeryTable] = [[], []]
//       console.log(lastDayOfMonth, nextDay)
//       for (const item of result[0].item) {
//         const res = await getClosingLastDay(
//           item.relatedAccount._id,
//           lastDayOfMonth,
//           nextDay
//         )
//         clinicTable.push({
//           amount: Math.abs(res),
//           operator: item.operator,
//           name: item.relatedAccount.name
//         })
//       }

//       for (const item of result[0].secondaryItem) {
//         const res = await getClosingLastDay(
//           item.relatedAccount._id,
//           lastDayOfMonth,
//           nextDay
//         )
//         surgeryTable.push({
//           amount: Math.abs(res),
//           operator: item.operator,
//           name: item.relatedAccount.name
//         })
//       }

//       const clinicTotal = await getTotal(clinicTable)
//       const surgeryTotal = await getTotal(surgeryTable)

//       totalArray.push({
//         surgery: surgeryTotal,
//         clinic: clinicTotal,
//         month: monthName
//       })
//     }

//     finalResult[element.description] = totalArray
//   }

//   // const GrossProfit = await subtractCostOfSalesFromSales(
//   //   finalResult.Sales,
//   //   finalResult.CostOfSales
//   // )

//   // const net = await getTotalData(finalResult)
//   // const netProfit = await subtractCostOfSalesFromSales(GrossProfit, net)

//   // finalResult = {
//   //   ...finalResult,
//   //   GrossProfit: GrossProfit,
//   //   NetProfit: netProfit
//   // }

//   return res.status(200).send({
//     success: true,
//     data: finalResult
//   })
// }

exports.getBalanceSheet = async (req, res) => {
  const finalResult = {}
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  const noteResult = await Note.find({ isDeleted: false, type: 'balance' })
  console.log(noteResult)
  for (const element of noteResult) {
    const totalArray = []

    for (const monthName of months) {
      const yearToQuery = new Date().getFullYear();
      const monthIndex = months.indexOf(monthName);

      // Get the first day of the month
      const firstDayOfMonth = new Date(yearToQuery, monthIndex, 1);

      // Get the last day of the month
      const lastDayOfMonth = new Date(yearToQuery, monthIndex, new Date(yearToQuery, monthIndex + 1, 0).getDate());

      const result = await Note.find({
        _id: element._id
      }).populate('item.relatedAccount secondaryItem.relatedAccount')

      const [clinicTable, surgeryTable] = [[], []]
      for (const item of result[0].item) {
        const res = await getClosingLastDay(
          item.relatedAccount._id,
          firstDayOfMonth,
          lastDayOfMonth
        )
        clinicTable.push({
          amount: Math.abs(res),
          operator: item.operator,
          name: item.relatedAccount.name,
          month:monthName
        })

      }
      for (const item of result[0].secondaryItem) {
        const res = await getClosingLastDay(
          item.relatedAccount._id,
          firstDayOfMonth,
          lastDayOfMonth,
        )
        surgeryTable.push({
          amount: Math.abs(res),
          operator: item.operator,
          name: item.relatedAccount.name,
          month:monthName
        })
      }
      console.log(clinicTable, surgeryTable)
      const clinicTotal = await getTotal(clinicTable)
      const surgeryTotal = await getTotal(surgeryTable)

      totalArray.push({
        surgery: surgeryTotal,
        clinic: clinicTotal,
        month: monthName
      })
    }

    finalResult[element.description] = totalArray
  }

  // const GrossProfit = await subtractCostOfSalesFromSales(
  //   finalResult.Sales,
  //   finalResult.CostOfSales
  // )

  // const net = await getTotalData(finalResult)
  // const netProfit = await subtractCostOfSalesFromSales(GrossProfit, net)

  // finalResult = {
  //   ...finalResult,
  //   GrossProfit: GrossProfit,
  //   NetProfit: netProfit
  // }

  return res.status(200).send({
    success: true,
    data: finalResult
  })
}


exports.listAllTransactions = async (req, res) => {
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
    let result = await Transaction.find(query).populate('relatedAccounting').populate('relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
    console.log(result)
    count = await Transaction.find(query).count();
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

exports.getTransaction = async (req, res) => {
  const result = await Transaction.find({ _id: req.params.id, isDeleted: false }).populate({
    path: 'relatedAccounting',
    model: 'AccountingLists',
    populate: {
      path: 'relatedHeader',
      model: 'AccountHeaders'
    }
  }).populate('relatedTreatment').populate({
    path: 'relatedTransaction',
    model: 'Transactions',
    populate: {
      path: 'relatedAccounting',
      model: 'AccountingLists'
    }
  }).populate('relatedBank').populate('relatedCash');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTransactionExpense = async (req, res) => {
  const result = await Transaction.find({ relatedExpense: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedTransaction').populate('relatedBank').populate('relatedCash').populate('relatedExpense');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTransactionIncome = async (req, res) => {
  const result = await Transaction.find({ relatedIncome: req.params.id, isDeleted: false }).populate('relatedAccounting').populate('relatedTransaction').populate('relatedBank').populate('relatedCash').populate('relatedIncome');
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.getRelatedTransaction = async (req, res) => {
  console.log(req.params.id)
  const result = await Transaction.find({ relatedAccounting: req.params.id, isDeleted: false }).populate('relatedAccounting relatedTreatment relatedBank relatedCash relatedMedicineSale relatedBranch')
    .populate('createdBy', 'givenName')
    .populate({
      path: 'relatedTransaction',
      model: 'Transactions',
      populate: {
        path: 'relatedAccounting relatedTreatment relatedBank relatedCash relatedMedicineSale relatedBranch'
      }
    });
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createTransaction = async (req, res, next) => {
  try {
    const newBody = req.body;
    const newTransaction = new Transaction(newBody);
    const result = await newTransaction.save();
    res.status(200).send({
      message: 'Transaction create success',
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    ).populate('relatedAccounting').populate('relatedTreatment').populate('relatedTransaction').populate('relatedBank').populate('relatedCash');
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
}

exports.activateTransaction = async (req, res, next) => {
  try {
    const result = await Transaction.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.trialBalanceWithID = async (req, res) => {
  try {
    const result = await Transaction.find({ relatedAccounting: req.params.relatedAccounting, type: 'Debit' }).populate('relatedAccounting relatedTreatment relatedBank relatedCash relatedTransaction relatedMedicineSale');
    if (result.length === 0) return res.status(500).send({ error: true, message: 'Data Not Found!' })
    return res.status(200).send({ success: true, debit: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }

}

const getTotalData = async (data) => {
  const result = data.OtherIncome.map((item, index) => ({
    month: item.month,
    surgery: item.surgery + data.AdministrationExpenses[index].surgery + data.OperationExpenses[index].surgery + data.SalesAndMarketingExpenses[index].surgery,
    clinic: item.clinic + data.AdministrationExpenses[index].clinic + data.OperationExpenses[index].clinic + data.SalesAndMarketingExpenses[index].clinic,
  }));

  return result;
}

const subtractCostOfSalesFromSales = async (Sales, CostOfSales) => {
  const result = Sales.map((salesItem, index) => {
    const costOfSalesItem = CostOfSales[index];
    return {
      month: salesItem.month,
      surgery: salesItem.surgery - costOfSalesItem.surgery,
      clinic: salesItem.clinic - costOfSalesItem.clinic,
    };
  });

  return result;
}

exports.incomeStatement = async (req, res) => {
  let finalResult = {}
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const noteResult = await Note.find({ isDeleted: false, type: 'income' })
  let keys = Object.keys(finalResult)
  for (const element of noteResult) {
    let totalArray = []
    for (const monthName of months) {
      //Sales-> Clinic and Surgery
      let [clinicTable, surgeryTable] = [[], []]
      let start = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName), 1));
      let end = new Date(Date.UTC(new Date().getFullYear(), months.indexOf(monthName) + 1, 1));
      const result = await Note.find({ _id: element._id }).populate('item.relatedAccount secondaryItem.relatedAccount')
      for (const item of result[0].item) {
        const res = await getNetAmount(item.relatedAccount._id, start, end)
        clinicTable.push({ amount: Math.abs(res), operator: item.operator, name: item.relatedAccount.name })
      }
      for (const item of result[0].secondaryItem) {
        const res = await getNetAmount(item.relatedAccount._id, start, end)
        surgeryTable.push({ amount: Math.abs(res), operator: item.operator, name: item.relatedAccount.name })
      }
      const clinicTotal = await getTotal(clinicTable)
      const surgeryTotal = await getTotal(surgeryTable)
      totalArray.push({ surgery: surgeryTotal, clinic: clinicTotal, month: monthName })
    }
    finalResult[element.description] = totalArray
  }
  let GrossProfit = await subtractCostOfSalesFromSales(finalResult.Sales, finalResult.CostOfSales)

  let net = await getTotalData(finalResult)
  let netProfit = await subtractCostOfSalesFromSales(GrossProfit, net)
  finalResult = { ...finalResult, GrossProfit: GrossProfit, NetProfit: netProfit }
  return res.status(200).send({
    success: true, data: finalResult
  })

}

exports.trialBalance = async (req, res) => {
  console.log('here')
  let finalResult = []
  let transaction = []
  let { start, end } = req.query
  try {
    const allAccounts = await AccountingList.find({}).populate('relatedType relatedHeader relatedTreatment relatedBank relatedBranch')
    for (let i = 0; i < allAccounts.length; i++) {
      const id = allAccounts[i]._id
      let netType = '';
      let netAmount = 0;
      console.log(id)
      const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
      for (let d = 0; d < debit.length; d++) {
        transaction.push({ relatedAccounting: debit[d].relatedAccounting, type: "Debit", date: debit[d].date, amount: debit[d].amount, remark: debit[d].remark })
      }
      // if (debit.length === 0) return res.status(500).send({error:true, message:'Debit Data Not Found!'})
      const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
      for (let c = 0; c < credit.length; c++) {
        transaction.push({ relatedAccounting: credit[c].relatedAccounting, type: "Credit", date: credit[c].date, amount: credit[c].amount, remark: credit[c].remark })
      }
      // if (credit.length === 0) return res.status(500).send({error:true, message:'Credit Data Not Found!'})
      const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      if (totalDebit === totalDebit) {
        netType = null
        netAmount = 0
      }
      netAmount = totalDebit - totalCredit
      if (netAmount > 0) netType = 'Debit'
      if (netAmount < 0) netType = 'Credit'
      finalResult.push({ totalCredit: totalCredit, totalDebit: totalDebit, netType: netType, netAmount: netAmount, accName: allAccounts[i].name, type: allAccounts[i].relatedType, relatedAccountingId: allAccounts[i]._id, header: allAccounts[i].relatedHeader ? allAccounts[i].relatedHeader.name : undefined, subHeader: allAccounts[i].subHeader })
    }
    console.log('Transaction:', transaction)
    if (allAccounts.length === finalResult.length) return res.status(200).send({ success: true, data: finalResult, transaction: transaction })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.trialBalanceWithType = async (req, res) => {
  let finalResult = []
  let { start, end, type } = req.query
  try {
    const allAccounts = await AccountingList.find({ relatedType: type }).populate('relatedType')
    for (let i = 0; i < allAccounts.length; i++) {
      const id = allAccounts[i]._id
      let netType = '';
      let netAmount = 0;
      const debit = await Transaction.find({ relatedAccounting: id, type: 'Debit', date: { $gte: start, $lte: end } })
      // if (debit.length === 0) return res.status(500).send({error:true, message:'Debit Data Not Found!'})
      const totalDebit = debit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      const credit = await Transaction.find({ relatedAccounting: id, type: 'Credit', date: { $gte: start, $lte: end } })
      // if (credit.length === 0) return res.status(500).send({error:true, message:'Credit Data Not Found!'})
      const totalCredit = credit.reduce((acc, curr) => acc + Number.parseInt(curr.amount), 0);

      if (totalDebit === totalDebit) {
        netType = null
        netAmount = 0
      }
      netAmount = totalDebit - totalCredit
      if (netAmount > 0) netType = 'Debit'
      if (netAmount < 0) netType = 'Credit'
      finalResult.push({ totalCredit: totalCredit, totalDebit: totalDebit, netType: netType, netAmount: netAmount, accName: allAccounts[i].name, type: allAccounts[i].relatedType })
    }
    if (allAccounts.length === finalResult.length) return res.status(200).send({ success: true, data: finalResult })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.bankCashTransactionReport = async (req, res) => {
  let { start, end, type, account } = req.query
  let query = { isDeleted: false }
  let [name, total] = ['', 0]
  try {
    if (start & end) query.createdAt = { $gte: start, $lte: end }
    if (type === 'Bank') query.relatedBank = account
    if (type === 'Cash') query.relatedCash = account

    const transactionResult = await Transaction.find(query)
      .populate('relatedAccounting relatedTreatment relatedBank relatedCash relatedMedicineSale relatedBranch')
      .populate('createdBy', 'givenName')
      .populate({
        path: 'relatedTransaction',
        model: 'Transactions',
        populate: {
          path: 'relatedAccounting relatedTreatment relatedBank relatedCash relatedMedicineSale relatedBranch'
        }
      });

    if (type === 'Bank') {
      name = transactionResult.reduce((result, { relatedBank, amount }) => {
        const { name } = relatedBank;
        result[name] = (result[name] || 0) + amount;
        return result;
      }, {});
      total = transactionResult.reduce((total, sale) => total + sale.amount, 0);
    } else {
      name = transactionResult.reduce((result, { relatedCash, amount }) => {
        const { name } = relatedCash;
        result[name] = (result[name] || 0) + amount;
        return result;
      }, {});
      total = transactionResult.reduce((total, sale) => total + sale.amount, 0);
    }
    return res.status(200).send({ success: true, data: transactionResult, names: name, total: total })
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
} 
