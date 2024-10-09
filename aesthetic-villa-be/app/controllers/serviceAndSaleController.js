'use strict';
const Treatment = require('../models/treatment');
const Accounting = require('../models/accountingList');

exports.listAllTreatmentsInBooking = async (req, res) => {
  let { keyword, role, limit, skip, per_page, current_page } = req.query;
  let count = 0;
  let page = 0;
  let response = []
  
  try {
    limit = per_page ? per_page : 0 ; //limit
    skip = current_page ? ( current_page - 1 ) * per_page : 0;
    let query = { isDeleted: false },
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';

    let result = await Treatment.find(query).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('machine.item_id').populate('procedureAccessory.item_id').populate('medicineLists.item_id').populate('procedureMedicine.item_id').populate('treatmentName')
                                .skip(skip)
                                .limit(limit)
    
    if(result){
       result.map(data => {
          response.push({id: data._id, title: data.name, image: null, description: null})
       })
    }
    count = await Treatment.find(query).count();
    const division = count / limit;
    page = Math.ceil(division);

    res.status(200).send({
      success: true,
      count: count,
      _metadata: {
        current_page: current_page,
        per_page: per_page || count,
        page_count: count / ( per_page || count),
        total_count: count,
      },
      data: response,
    });
  } catch (e) {
    console.log(e)
    //return res.status(500).send({ error: true, message: e.message });
  }
};

exports.getTreatmentInBooking = async (req, res) => {
  let response = {}
  const result = await Treatment.findOne({ _id: req.params.id, isDeleted: false }).populate('relatedDoctor').populate('relatedTherapist').populate('relatedPatient').populate('machine.item_id').populate('procedureAccessory.item_id').populate('medicineLists.item_id').populate('procedureMedicine.item_id').populate('treatmentName')
  if (!result) {
     return res.status(500).json({ error: true, message: 'No Record Found' });
  }
  else { 
     response.id = result._id
     response.title = result.name
     response.description = null
     response.image = null
     return res.status(200).send({ success: true, data: response })
    };
};