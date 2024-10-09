const cors = require('cors');
require('dotenv').config()
const path = require('path');
const cronitor = require('cronitor')('bb06d5c8745f45f2a9fc62755b7414ea');
const createIndexs = require('./dbIndexes').createIndex
const express = require('express'),
  bodyParser = require('body-parser'),
  cron = require('node-cron'),
  mongoose = require('mongoose'),
  config = require('./config/db'),
  app = express(),
  server = require('http').Server(app),
  port = process.env.PORT 
app.use(cors({ origin: '*' }));

const userUtil = require('./app/lib/userUtil');
// mongoose.set('strictQuery', true);


//mongoose.set('useCreateIndex', true) // to remove -> DeprecationWarning: collection.ensureIndex is deprecated. Use createIndex instead.

// mongoose instance connection url connection
if (mongoose.connection.readyState != 1) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db, { useNewUrlParser: true, retryWrites: false, useUnifiedTopology: true });

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.log(err)
  });

  db.once('open', function () {
    console.log('Database is connected');
  });

  db.collection('patients').createIndex({ name: 'text', phone: 'text', email: 'text', patientID: 'text' }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("Patient Indexes Created Successfully!");
    }

    db.collection('appointments').createIndex({
      status: 'text',
      phone: 'text'
    }, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log("Appointment Indexes Created Successfully!")
      }
    })

    db.collection('brands').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log('Brand Indexes Created Successfully!')
      }
    })

    db.collection('treatmentlists').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment List Indexes Created Successfully!') }
    })

    db.collection('currencies').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Currency Indexes Created Successfully!') }
    })

    db.collection('medicineitems').createIndex({
      code: 'text',
      medicineItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('medicineItems Indexes Created Successfully!') }
    })

    db.collection('accessoryitems').createIndex({
      code: 'text',
      accessoryItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Accessory Items Indexes Created Successfully!') }
    })

    db.collection('procedureitems').createIndex({
      code: 'text',
      procedureItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Items Indexes Created Successfully!') }
    })

    db.collection('procedureaccessories').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Accessories Indexes Created Successfully!') }
    })

    db.collection('proceduremedicines').createIndex({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Medicine Indexes Created Successfully!') }
    })

    db.collection('medicinelists').createIndex({
      code: 'text',
      procedureItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Medicine Lists Indexes Created Successfully!') }
    })

    db.collection('treatments').createIndex({
      treatmentCode: 'text',
      treatmentName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment Indexes Created Successfully!') }
    })

    db.collection('treatmentselections').createIndex({
      code: 'text',
      selectionStatus: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment Indexes Created Successfully!') }
    })

  });
  module.exports = db;
}
mongoose.plugin((schema) => {
  schema.options.usePushEach = true;
});

//static files
app.use('/static', express.static(path.join(__dirname, 'uploads')));

// Bring in our dependencies
require('./config/express')(app, config);

server.listen(port, () => {
  console.log('We are live on port: ', port);
});

cronitor.wraps(cron);
cronitor.schedule('AccountBalanceClosingAndOpening', '55 23 * * *', async function () {
  console.log('Managing AccountBalance for every Accounting Accs!');
  const isLastDay = await userUtil.getLatestDay();
  if (isLastDay === true) {
    await userUtil.fixedAssetTransaction();
    await userUtil.createAccountBalance();

  } else {
    console.log('Today is not the right day for the scheduled task!');
  }
});

// cron.schedule('55 23 * * *', () => {
//   (async () => {
//     const isLastDay = await userUtil.getLatestDay();
//     if (isLastDay === true) {
//       await userUtil.createAccountBalance();
//     } else {
//       console.log('Today is not the right day for the scheduled task!');
//     }
//   })();
// });

