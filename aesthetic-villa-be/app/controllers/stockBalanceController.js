const { loopThroughItems } = require("../lib/generalFunction")
const AccessoryItem = require("../models/accessoryItem")
const MedicineItem = require("../models/medicineItem")
const ProcedureItem = require("../models/procedureItem")
const StockBalance = require("../models/stockBalance")

exports.createStockBalance = async (req,res) => {
    // for closing
    let { type, date } = req.body
    let query = { isDeleted: false }
    try {
      type ? query["type"] = type : ""
      let startDate = new Date(date)
      let endDate = new Date( startDate.getFullYear(), startDate.getMonth(), 
                              startDate.getDate() + 1, startDate.getHours(),
                              startDate.getMinutes(), startDate.getSeconds() )
      query["date"] = { $gte: new Date(startDate),
                        $lt: new Date(endDate)               
      }
      let queryIfClosingExitOrNot = await StockBalance.findOne(query)
      if(queryIfClosingExitOrNot){
         res.status(500).send({
            error: true,
            message: "Stock Closing Balance is already existed"
         })
      }else {
        let { type,date, ...data } = req.body
        const saveClosingResult = await StockBalance.create(req.body)
        //for opening
        data["date"] = new Date(endDate)
        data["type"] = "Opening"
        const saveOpeningResult = await StockBalance.create(data)
        res.status(200).send({
            success: true,
            message: "Stock Closing Balance is created successfully"
        })

      }
    }catch(error){
        res.status(200).send({
            error: true,
            message: error.message
        })
    }
}

exports.listAllStockBalance = async (req,res) =>{
    let { date, type, limit, skip } = req.query
    let query = { isDeleted: false }
    try{
      const startDate = new Date(date)
      let endDate = new Date( startDate.getFullYear(), startDate.getMonth(), 
                              startDate.getDate() + 1, startDate.getHours(),
                              startDate.getMinutes(), startDate.getSeconds() )
      date ? query["date"] = { $gte: new Date(startDate), $lt: new Date(endDate) }
           : ""
      type ? query["type"] = type : ""
      limit ? limit = limit: 0
      skip ? skip = (skip * limit) :0
      let queryStockBalance = await StockBalance.find(query).limit(limit).skip(skip)
      let count =  await StockBalance.find(query).count()
      res.status(200).send({
        success: true,
        data: queryStockBalance,
        meta_data: {
          count: count,
          total_page: count / (limit || count),
          limit: limit,
          skip: skip
        }
      })
    }catch(error) {
        res.status(200).send({
            error: true,
            message: error.message
        })
    }
}

exports.getStockBalanceById = async (req,res) => {
    try{
      let queryStockBalanceById = await StockBalance.findById(req.params.id)
      res.status(200).send({
        success: true,
        data: queryStockBalanceById
      })
    }catch(error) {
        res.status(200).send({
            error: true,
            message: error.message
        })
    }
}

exports.updateStockBalanceById = async (req,res) => {
    try{
      let data = req.body
      let updateStockBalanceById = await StockBalance.findByIdAndUpdate(req.params.id,data,{new: true})
      res.status(200).send({
        success: true,
        data: updateStockBalanceById
      })
    }catch(error) {
        res.status(200).send({
            error: true,
            message: error.message
        })
    }
}

exports.deleteStockBalanceById = async (req,res) => {
    try{
      let deleteStockBalanceById = await StockBalance.findByIdAndUpdate(req.params.id,{isDeleted: true},{new: true})
      res.status(200).send({
        success: true,
        data: deleteStockBalanceById
      })
    }catch(error) {
        res.status(200).send({
            error: true,
            message: error.message
        })
    }
}

// opening and closing qty after the month
exports.createOpeningClosingQty = async (req,res) => {
    // let { accessoryItem, medicineItem, procedureItem } = req.body
    try{
      
          let accessoryItem = await AccessoryItem.find({isDeleted: false})
          accessoryItem.map(async (accessory) => {
             let result = await AccessoryItem.findOne({ _id: accessory.id}).then(result =>{
              
                result.purchaseQty = 0
                result.useQty= 0,
                result.openingQty = result.currentQty,
                result.closingQty =  result.currentQty
                result.save()
             
             })
          })
          let medicineItem = await MedicineItem.find({isDeleted:false})
          medicineItem.map(async (medicine) => {
           let result = await MedicineItem.findOne({ _id: medicine.id}).then(result =>{
              
            result.purchaseQty = 0
            result.useQty= 0,
            result.openingQty = result.currentQty,
            result.closingQty =  result.currentQty
            result.save()
         })
        })
     
        let procedureItem = await ProcedureItem.find({isDeleted:false})
        procedureItem.map(async (procedure) => {
           let result = await ProcedureItem.findOne({_id: procedure.id}).then((result =>{
              
            result.purchaseQty = 0
            result.useQty= 0,
            result.openingQty = result.currentQty,
            result.closingQty =  result.currentQty
            result.save()
         }))
        })
     
       res.status(200).send({
         success: true,
         message: "Succefully Added"
       })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}

// update items' detail after a month
exports.updateItemsAfterAMonth = async (req,res) => {
  try{
    let { medicineItems, procedureItems, accessoryItems } =req.body
    if(medicineItems.length != 0){
        loopThroughItems(medicineItems, async function(id){
            let MedicineItemUpdate = await MedicineItem.findOne({_id: id}).then(result => {
              result.openingQty= result.currentQuantity
              result.closingQty= result.currentQuantity
              result.purchaseQty= 0
              result.useQty= 0
              result.save()
            }
            )
        })
    }
    if(procedureItems.length != 0){
      loopThroughItems(procedureItems, async function(id){
          let ProcedureItemUpdate = await ProcedureItem.findOne({_id: id}).then(result => {
            result.openingQty= result.currentQuantity
            result.closingQty= result.currentQuantity
            result.purchaseQty= 0
            result.useQty= 0
            result.save()
          }
          )
      })
  }
  if(accessoryItems.length != 0){
    loopThroughItems(accessoryItems, async function(id){
        let AccessoryItemUpdate = await AccessoryItem.findOne({_id: id}).then(result => {
          result.openingQty= result.currentQuantity
          result.closingQty= result.currentQuantity
          result.purchaseQty= 0
          result.useQty= 0
          result.save()
        }
        )
    })
   }
    res.status(200).send({
      success: true,
      message: "Successfully Update"
    })
  }catch(error){
    res.status(500).send({
      error: true,
      message: error.message
    })
  }
}