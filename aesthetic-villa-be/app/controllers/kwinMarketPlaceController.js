const { default: mongoose } = require("mongoose")
const medicineList = require("../models/medicineList")
const medicineItem = require("../models/medicineItem")
const category = require("../models/category")
const subCategory = require("../models/subCategory")
const treatmentList = require("../models/treatmentList")
const treatment = require("../models/treatment")

const paginate = ( arr, current_page, per_page ) => {
    return arr.splice(((current_page || 1) - 1)* per_page, per_page * (current_page || 1))
}
// treatment categories
exports.listAllTreatmentUnit = async (req,res) => {
    try{
        let result = [
            { title : 'Treatment'},
            { title: 'Hair,Combine Tre & Facial'},
            { title:'Injection' },
            { title:'Combination Package' },
            { title:'Surgery Price List' }
            ]
            res.status(200).send({
                success: true,
                data: result
            })
        }catch(error){
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
}

// treatment list categories
exports.listAllTreatmentSubCategories = async (req,res) => {
    try{
        let { category } = req.query
        let query = {isDeleted: false}
        category ? query["bodyParts"] = category : ""
        let result = await treatmentList.aggregate([
            {
                $match: {
                    ...query
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: {"$first": "$name"},
                    category: {"$first": "$bodyParts"}
                }
            }
        ])
            res.status(200).send({
                success: true,
                data: result
            })
        }catch(error){
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
}

// treatment list categories by Id
exports.listAllTreatmentSubCategoriesById = async (req,res) => {
    try{
        let query = {isDeleted: false}
        query["_id"] = new mongoose.Types.ObjectId(req.params.id) 
        let result = await treatmentList.aggregate([
            {
                $match: {
                    ...query
                }
            },
            {
                $group: {
                    _id: "$_id",
                    title: {"$first": "$name"},
                    category: {"$first": "$bodyParts"}
                }
            }
        ])
            res.status(200).send({
                success: true,
                data: result
            })
        }catch(error){
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
}

// treatment all product
exports.listAllProduct = async (req,res) => {
    try{
        let { subcategory, category,per_page, current_page } = req.query
        let query = {isDeleted: false}
        console.log("categroe",category)
        subcategory ? query["treatmentName"] = new mongoose.Types.ObjectId(subcategory) : ""
        let pipeline = [
            {
                $match: {
                    ...query
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: {"$first": "$name"},
                    description: { "$first": "$description" },
                    sellingPrice: { "$first": "$sellingPrice" },
                    discount: { "$first": "false"},
                    discountValue: { "$first": "$discount"},
                    stockQty: { "$first": "none"},
                    image: { "$first": "none"},
                    subcategory: {"$first": "$treatmentName"}
                }
            },
            {
                $lookup: {
                    from: "treatmentlists",
                    localField: "subcategory",
                    foreignField: "_id",
                    as: "subcategory"
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
            $project: {
                _id: 0,
                id: "$_id",
                name: 1,
                description: 1,
                sellingPrice: 1,
                discount: 1,
                discountValue: 1,
                stockQty: 1,
                image: 1,
                subcategory: { $arrayElemAt: ["$subcategory.name",0] },
                category: { $arrayElemAt: ["$subcategory.bodyParts", 0] }
            }
        },
        ]
        if(per_page && !category){
            let parsePerPageInt = parseInt(per_page)
            let parseCurrentPage = parseInt((current_page - 1 || 0) * per_page) 
            pipeline.push({$skip: parseCurrentPage})
            pipeline.push({$limit: parsePerPageInt})
           
        } 
        let result = await treatment.aggregate(pipeline)
        let count =  await treatment.find(query).count() 
        if(category) {
            if(per_page){
              let items = result.filter(res => res.category == category)
              count = items.length || 0
              result = paginate(items, current_page, per_page)
            }else{
              result = result.filter(res => res.category == category) 
              count = result.length != 0 ? result.length : 0
            }
           
        }
            res.status(200).send({
                success: true,
                data: result,
                _metadata: {
                    total_pages: Math.ceil( count / per_page) || 1,
                    per_page: per_page,
                    current_page: (current_page || 1),
                    count: count
                }
            })
        }catch(error){
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
}

// treatment all product
exports.listAllProductById = async (req,res) => {
    try{
        let query = {isDeleted: false}
        query["_id"] = new mongoose.Types.ObjectId(req.params.id) 
        let result = await treatment.aggregate([
            {
                $match: {
                    ...query
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: {"$first": "$name"},
                    description: { "$first": "$description" },
                    sellingPrice: { "$first": "$sellingPrice" },
                    discount: { "$first": "false"},
                    discountValue: { "$first": "$discount"},
                    stockQty: { "$first": "none"},
                    image: { "$first": "none"},
                    subcategory: {"$first": "$treatmentName"}
                }
            },
            {
                $lookup: {
                    from: "treatmentlists",
                    localField: "subcategory",
                    foreignField: "_id",
                    as: "subcategory"
                }
            },
            {
            $project: {
                name: 1,
                description: 1,
                sellingPrice: 1,
                discount: 1,
                discountValue: 1,
                stockQty: 1,
                image: 1,
                subcategory: { $arrayElemAt: ["$subcategory.name",0] },
                category: { $arrayElemAt: ["$subcategory.bodyParts", 0] }
            }
        }
        ])
            res.status(200).send({
                success: true,
                data: result
            })
        }catch(error){
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
}

exports.listAllCategories =  async (req,res) => {
    try{
    let result = await category.aggregate([
        {
            $match: {
                isDeleted: false
            }
        },
        {
            $group: {
                _id: "$_id",
                title: {
                    $first: "$name"
                }
            }
        }
    ])
        res.status(200).send({
            success: true,
            title: result
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}
exports.listCategoryById =  async (req,res) => {
    try{
    let result = await category.aggregate([
        {
            $match: {
                isDeleted: false,
                _id: new mongoose.Types.ObjectId(req.params.id)
            }
        },
        {
            $group: {
                _id: "$_id",
                title: {
                    $first: "$name"
                }
            }
        }
    ])
        res.status(200).send({
            success: true,
            title: result
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}

exports.listAllSubcategory = async (req,res) => {
    try{
        let { category, current_page, per_page, total_page } = req.query
        let query = { isDeleted: false }
        category ? query["relatedCategory"] = new mongoose.Types.ObjectId(category) : ""
        console.log("query",query)
        let count = await subCategory.find(query).count()
        let pipeline = [
            {
                $match:  {...query},
            },
            {
                $group: {
                    _id: "$_id",
                    title: { "$first": "$name"},
                    categories: {"$first": "$relatedCategory"}
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    categories: {
                        $arrayElemAt: ["$categories.name",0]
                    }
                }
            }
        ]
        if(per_page) {
            let parsePerPage = parseInt(per_page)
            let parseCurrentPage = parseInt(current_page)
            let skip =  ( (parseCurrentPage || 1) -1 ) * parsePerPage
            console.log("skip",skip)
            if( !isNaN(parsePerPage) && parsePerPage > 0) pipeline.push({ $limit: parsePerPage},{$skip: ( (parseCurrentPage || 1) -1 ) * parsePerPage})
            // pipeline.push({ $limit: parsePerPage},)
         }
        let result = await subCategory.aggregate(pipeline)
        res.status(200).send({
            success: true,
            data: result,
            count: count,
            _metadata: {
                current_page: current_page,
                per_page: per_page,
                total_page: ( count/ per_page) || (count/ count)
            }
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}

exports.listSubCategoriesById = async (req,res) => {
    try{
        let result = await subCategory.aggregate([
            {
                $match:  {
                    _id: new mongoose.Types.ObjectId(req.params.id)
                },
            },
            {
                $group: {
                    _id: "$_id",
                    title: { "$first": "$name"},
                    categories: {"$first": "$relatedCategory"}
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "categories"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    categories: {
                        $arrayElemAt: ["$categories.name",0]
                    }
                }
            }
        ])
        res.status(200).send({
            success: true,
            data: result
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}

exports.listAllMedicineList = async (req,res) => {
    try{
        let {subcategory, category} = req.query
        let query = {isDeleted: false}
        subcategory ? query["relatedSubCategory"] = new mongoose.Types.ObjectId(subcategory) : ""
        category ? query["relatedCategory"] = new mongoose.Types.ObjectId(category) : ""
        let result = await medicineList.aggregate([
            {
                $match:  {
                    ...query
                },
            },
            {
                $group: {
                    _id: "$_id",
                    title: { "$first": "$name"},
                    subcategories: {"$first": "$relatedSubCategory"}
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategories",
                    foreignField: "_id",
                    as: "subcategories"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    subcategories: {
                        $arrayElemAt: ["$subcategories.name",0]
                    }
                }
            }
        ])
        res.status(200).send({
            success: true,
            data: result
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}


exports.listAllMedicineListById = async (req,res) => {
    try{
        let result = await medicineList.aggregate([
            {
                $match:  {
                    _id: new mongoose.Types.ObjectId(req.params.id)
                },
            },
            {
                $group: {
                    _id: "$_id",
                    title: { "$first": "$name"},
                    subcategories: {"$first": "$relatedSubCategory"}
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subcategories",
                    foreignField: "_id",
                    as: "subcategories"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    subcategories: {
                        $arrayElemAt: ["$subcategories.name",0]
                    }
                }
            }
        ])
        res.status(200).send({
            success: true,
            data: result
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}

exports.listAllProductList = async (req,res) => {
    try{
        let { medicinelist } = req.query
        let query = {isDeleted: false}
        medicinelist ? query["name"] = new mongoose.Types.ObjectId(medicinelist) : ""
        let result = await medicineItem.aggregate([
            {
                $match:  {
                    ...query
                },
            },
            {
                $group: {
                    _id: "$_id",
                    name: { "$first": "$medicineItemName"},
                    description: { "$first": "description" },
                    sellingPrice: { "$first": "$sellingPrice" },
                    stockQty: { "$first": "$totalUnit" },
                    medicineList: {"$first": "$name"}
                }
            },
            {
                $lookup: {
                    from: "medicinelists",
                    localField: "medicineList",
                    foreignField: "_id",
                    as: "medicineList"
                }
            },
            // {
            //     $lookup: {
            //         from: "subcategories",
            //         localField: "medicineList.relatedSubCategory",
            //         foreignField: "_id",
            //         as: "subcategory"
            //     }
            // },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    sellingPrice:1,
                    stockQty:1,
                    medicineList:1
                    // medicineList: {
                    //     $arrayElemAt: ["$medicineList.name",0]
                    // },
                    // subcategory: {
                    //     $arrayElemAt: ["$medicineList.relatedSubCategory.name",0]
                    // }
                }
            }
        ])
        res.status(200).send({
            success: true,
            data: result
        })
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}
