'use strict';
const ProcedureItems = require('../models/procedureItem');
const MedicineItems = require('../models/medicineItem');
const AccessoryItems = require('../models/accessoryItem');

exports.checkReorder = async (req, res) => {
    try {
        const relatedMedicineItems = await MedicineItems.find({})
        const relatedAccessoryItems = await AccessoryItems.find({})
        const relatedProcedureItems = await ProcedureItems.find({})
        const ProcedureItemsResult = relatedProcedureItems.filter(item => item.currentQty <= item.reOrderQuantity);
        const AccessoryItemsResult = relatedAccessoryItems.filter(item => item.currentQty <= item.reOrderQuantity);
        const MedicineItemsResult = relatedMedicineItems.filter(item => item.currentQty <= item.reOrderQuantity);
        return res.status(200).send({
            success: true, data: {
                ProcedureItems: ProcedureItemsResult,
                AccessoryItems: AccessoryItemsResult,
                MedicineItems: MedicineItemsResult
            },
        })
    } catch (error) {
        return res.status(500).send({ error: true, message: error.message })
    }
}