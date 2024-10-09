'use strict';
const User = require('../models/user');
const CONFIG = require('../../config/db');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  let data = req.body;
  try {
    data = {...data, isUser:true} // set user role
    const newUser = new User(data);
    let result = await newUser.save();
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (e) {
    const duplicateKey = Object.keys(e.keyValue)
    if (e.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: `${duplicateKey} is already registered!` });
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.createDoctor = async (req, res) => {
  let data = req.body;
  try {
    data = {...data, isDoctor:true} // set doctor role
    const newUser = new User(data);
    let result = await newUser.save();
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (e) {
    const duplicateKey = Object.keys(e.keyValue)
    if (e.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: `${duplicateKey} is already registered!` });
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.createAdmin = async (req, res) => {
  let data = req.body;
  try {
    data = {...data, isAdmin:true} // set admin role
    const newUser = new User(data);
    let result = await newUser.save();
    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (e) {
    const duplicateKey = Object.keys(e.keyValue)
    if (e.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: `${duplicateKey} is already registered!` });
    return res.status(500).send({ error: true, message: e.message });
  }
};

exports.listAllUsers = async (req, res) => {
  let { keyword, role, limit, skip } = req.query;
  let count = 0;
  let page = 0;
  try {
    limit = +limit <= 100 ? +limit : 10;
    skip = +skip || 0;
    let query = {isDeleted:false},
      regexKeyword;
    role ? (query['role'] = role.toUpperCase()) : '';
    keyword && /\w/.test(keyword)
      ? (regexKeyword = new RegExp(keyword, 'i'))
      : '';
    regexKeyword ? (query['name'] = regexKeyword) : '';

    let result = await User.find(query);
    count = await User.find(query).count();
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

exports.getUserDetail = async (req, res) => {
  try {
    let result = await User.findById(req.params.id);
    if (!result)
      return res.status(500).json({ error: true, message: 'No record found.' });
    res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.updateUser = async (req, res, next) => {
  let data = req.body;
  try {

    const {password, ...preparation} = data //removes password field from data
    let result = await User.findByIdAndUpdate(req.body.id, {$set:preparation}, {
      new: true,
    });
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(500)
        .send({ error: true, message: 'This email is already registered!' });
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.checkPermissionToChangePassword = async (req,res, next) =>{
    let {givenemail} = req.body
    let checkPermission = await User.findOne({email:givenemail});
    if(checkPermission){
       checkPermission.accRole === "master" 
                                   ? next() 
                                   : res.status(403)
                                         .send({error: true, 
                                                message: "You aren't allowed to update password"})
    }
    else {
      res.status(403)
      .send({error: true, 
             message: "Give me the master email as givenemail."})
    } 
}

exports.changePassword = async (req,res,next) => {
     console.log("this is password ", req.body)
     let { email, password } = req.body
     let findUser = await User.findOne({email: email});
     if(findUser){
      let user = findUser
      bcrypt.genSalt(CONFIG.db.saltWorkFactor, function (err, salt) {
        if (err) return next(err);
        
        // hash the password along with our new salt
        bcrypt.hash(password, salt, async function (err, hash) {
          if (err) return next(err);
          console.log("this is salt",salt,hash)
          // override the cleartext password with the hashed one
          await User.findByIdAndUpdate(user._id, {password: hash})
          res.status(200).send({success:true, message:"Successfully update password"})
        });
      });
     }
     else {
      res.status(403)
      .send({error: true, 
             message: "There is no user"})
     }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true }
    );
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const result = await User.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true }
    );
    return res
      .status(200)
      .send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message });
  }
};
