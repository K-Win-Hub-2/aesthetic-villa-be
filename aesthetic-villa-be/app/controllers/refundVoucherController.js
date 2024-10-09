const AccountingList = require("../models/accountingList");
const TreatmentVoucher = require("../models/treatmentVoucher");
const TreatmentSelection = require("../models/treatmentSelection");
const Stock = require("../models/stock");
const MedicineItem = require("../models/medicineItem");
//loopItems function 
const loopItems = (length,fn)=>{
  for(let i = 0; i<length; i++){
    fn(i)
  }
}


//list refund voucher
exports.listAllRefundVoucher = async (req, res, next) => {
   
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0 ;

  try {
       limit = +limit <= 100 ? +limit : 10;
       skip += skip || 0 ;
       let query = {isDeleted:false} , regexKeyword
      // role ? ( query["role"] )
   } catch (error) {
     res.status(500)
     .send({
       error : "Failed to list all refund voucher",
       message : error.message
     })
   }
}

//create refund voucher 
exports.createRefundVoucher = async( req, res, next) =>{
  try{
    //let { code, amount, date, refundAccount, refundVoucherId, remark, type, selections } = req.body;
    let {  cashBackAmount, date, refundAccount, refundVoucherId, remark, type, selections, newTreatmentVoucherId, relatedMedicineItems, relatedAccessoryItems, relatedProcedureItems  } = req.body;
    //let data = {voucherCode : code, refundAccount: refundAccount,refundVoucherId: refundVoucherId, refundDate: date, reason: remark, refundType: type, cashBackAmount: amount};
  
    
    if(newTreatmentVoucherId){
       //update new treatment voucher id 
       let updatedNewTreatmentVoucherId = await TreatmentVoucher.findByIdAndUpdate(
        refundVoucherId,
        {
            newTreatmentVoucherId: newTreatmentVoucherId
        }
    )
    }
    else {
         if(refundAccount){
          console.log("refund account is "+JSON.stringify(refundAccount))
         }
         //payload from req.body to update treatment voucher
         let updateTreatmentVoucherData = {
           Refund :true,
           refundAccount: refundAccount || null,
         //  refundAmount: refundAmount || null,
           refundVoucherId: refundVoucherId,
           refundDate: date, 
           refundReason: remark, 
           refundType: type, 
           cashBackAmount: cashBackAmount,
         // newTreatmentVoucherCode: newTreatmentVoucherCode || null,
         // newTreatmentVoucherId: newTreatmentVoucherId || null
         };
     //let result = await RefundVouchers.create(data);
     if(selections.length != 0 ){
     for(let i = 0 ; i < selections.length ; i++ ) {
     let treatmentSelectionId = selections[i].id;
     let updateTreatmentSelectionRefund = await TreatmentSelection.findByIdAndUpdate(
     treatmentSelectionId,
     {
     Refund : true, 
     }
     )
     }
     //  selections.map(selection => async{
     //     let treatmentSelectionId = selection.id;
     //     let updateTreatmentSelectionRefund = await TreatmentSelection.findByIdAndUpdate(
     //       treatmentSelectionId,
     //       {
     //         Refund : true
     //       }
     //     )
     //  })
     }
     // let queryVoucher = await TreatmentVoucher.findById(refundVoucherId);
     // queryVoucher.Refund = true;
     // let nooftreatmentselection = queryVoucher.relatedTreatmentSelection.length;
     // for (let i = 0 ; i < nooftreatmentselection; i++ ){
     //       queryVoucher.relatedTreatmentSelection[i].Refund = true;
     // }
     //  queryVoucher.save();
     //console.log("rf "+JSON.stringify(updateTreatmentVoucherData))
     let addRefund = await TreatmentVoucher.findByIdAndUpdate(refundVoucherId, updateTreatmentVoucherData
     )

       //add stock the quantity of refund amount
   //loop relatedeMedicineItems
   if(relatedMedicineItems){
    loopItems(relatedMedicineItems.length,async function(index){
      let relatedMedicineItemsId = relatedMedicineItems[index].item_id;
      let relatedMedicineItemsQuantity = relatedMedicineItems[index].qty;
     // console.log("id is "+JSON.stringify(filter))
      let queryMedicineItem = await MedicineItem.findById(relatedMedicineItemsId);
      if(queryMedicineItem){
        let totalUnit = queryMedicineItem.totalUnit + relatedMedicineItemsQuantity;
        let updatedMedicineItem= await MedicineItem.findByIdAndUpdate(
        relatedMedicineItemsId,
        {
          totalUnit:totalUnit
        }
        )
      }
      
   })
   }
   
   
   
   
     /// let updatevoucher = await TreatmentVoucher.findById(refundVoucherId);
     ///  console.log("Result is "+JSON.stringify(updatevoucher))
     let queryAccountingLists = await AccountingList.findById(refundAccount);
     let amounts = queryAccountingLists.amount - cashBackAmount;
     let updatedAccountingLists = await AccountingList.findByIdAndUpdate(refundAccount,{
     amount:amounts
     })
   }
    //query accounting list 
   // let queryUpdatedAccountingLists = await AccountingList.findById(refundAccount);

    //query refund voucher 
  //  let queryRefundVoucher = await RefundVouchers.findById({refundVoucherId : refundVoucherId}).populate("AccountingLists Vouchers")
    res.status(200).send({
        message: "Refund created successfully",
     //   refundVouchers: queryRefundVoucher,
       // accountingList : queryUpdatedAccountingLists
    })
  }
  catch(error){
     res.status(500).send({error:"can't created ",message:error.message})
  }
       
}