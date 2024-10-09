const path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'production';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'Clinic-Denovo',
    },
    //db: 'mongodb://127.0.0.1:3221', 
    db: 'mongodb+srv://pyaephyokwintech:5NhJPFwcnWwhBh97@cluster0.r1la8.mongodb.net/Asethetic-Villa',
    //db: 'mongodb+srv://dbuser:P7qBNveg8bVO1d2z@cluster0.85ozwwv.mongodb.net/cherry-k?retryWrites=true&w=majority', 
    uploadsURI: ['./uploads/cherry-k/img', './uploads/cherry-k/excel', './uploads/cherry-k/history', './uploads/cherry-k/before', './uploads/cherry-k/after', './uploads/cherry-k/consent', './uploads/cherry-k/payment', './uploads/cherry-k/sendEmail'],
    dbName: 'cherry-k',
    maxLoginAttempts: 5,
    lockTime: 30 * 60 * 1000,
    jwtSecret: 'McQTEUrP=ut*Cr1e4trEDO$q796tEDHz+Sf9@0#YpKFMDZmHR@th5y=7VJtcXk3WU',
    jwtKey: 'm*qf63GOeu9*9oDetCb63Y',
    defaultPasswordExpire: 86400,
    senderEmail: 'info.clinicdenovo@gmail.com',
    senderPassword: 'rftobtfnqwfgodoe',
    savePDF: './uploads/cherry-k/sendEmail'
  },

  production: {
    root: rootPath,
    app: {
      name: 'Clinic-Denovo',
    },
    //db: 'mongodb://127.0.0.1:3221', 
    //db: 'mongodb+srv://dbuser:P7qBNveg8bVO1d2z@cluster0.85ozwwv.mongodb.net/cherry-k?retryWrites=true&w=majority',
    db: 'mongodb+srv://pyaephyokwintech:5NhJPFwcnWwhBh97@cluster0.r1la8.mongodb.net/Asethetic-Villa',
    uploadsURI: ['./uploads/cherry-k/img', './uploads/cherry-k/excel', './uploads/cherry-k/history', './uploads/cherry-k/before', './uploads/cherry-k/after', './uploads/cherry-k/consent', './uploads/cherry-k/payment', './uploads/cherry-k/sendEmail'],
    dbName: 'cherry-k',
    maxLoginAttempts: 5,
    lockTime: 30 * 60 * 1000,
    jwtSecret: 'McQTEUrP=ut*Cr1e4trEDO$q796tEDHz+Sf9@0#YpKFMDZmHR@th5y=7VJtcXk3WU',
    jwtKey: 'm*qf63GOeu9*9oDetCb63Y',
    defaultPasswordExpire: 86400,
    senderEmail: 'info.clinicdenovo@gmail.com',
    senderPassword: 'rftobtfnqwfgodoe',
    savePDF: './uploads/cherry-k/sendEmail'
  },
};

module.exports = config[env];
