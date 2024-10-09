//verify doctor is for voucher according to doctor's id

const Doctor = require("../models/doctor");
const nurse = require("../models/nurse");
const Therapist = require("../models/therapist");
//verify doctor according to name and code 
exports.verifyDoctor = async ( req, res, next)=>{
    let { name, code, isDoctor, isNurse } = req.body;
    let query = { isDeleted:false, name:name, code: code};
    console.log('query doctor is ')
    if(isDoctor){
       let findDoctor = await Doctor.find(query).select("-code").count();
       findDoctor === 1 ?
        next()
       : res.status(500).send({
        error:true,
        message: "Doctors Login Error. May be name or code was wrong."
     })
    }
    else if(isNurse){
      let findNurse = await nurse.find(query).select("-code").count();
      findNurse === 1 ?
        next()
       : res.status(500).send({
        error:true,
        message: "Nurse Logins Error. May be name or code was wrong."
     })
    }
    else {
      let findTherapist = await Therapist.find(query).select("-code").count();
      findTherapist === 1 ?
        next()
       : res.status(500).send({
        error:true,
        message: "Therapist Logins Error. May be name or code was wrong."
     })
    }
   

}