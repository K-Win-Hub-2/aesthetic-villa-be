const MongoClient = require('mongodb').MongoClient;
const config = require('./config/db')

exports.createIndexes = () => {
  // Create a new MongoClient
  const client = new MongoClient(config.db);

  // Use connect method to connect to the server
  client.connect(function (err) {
    console.log("Successfully connected to the server!");

    const db = client.db(config.dbName);

    // Create indexes
    db.collection('patients').createIndexes({ name: 'text', phone: 'text', email: 'text', patientID: 'text' }, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log("Patient Indexes Created Successfully!");
      }

      client.close();
    });

    db.collection('appointments').createIndexes({
      status: 'text',
      phone: 'text'
    }, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log("Appointment Indexes Created Successfully!")
      }
    })

    db.collection('brands').createIndexes({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) {
        console.log(err)
      } else {
        console.log('Brand Indexes Created Successfully!')
      }
    })

    db.collection('treatmentlists').createIndexes({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment List Indexes Created Successfully!') }
    })

    db.collection('currencies').createIndexes({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Currency Indexes Created Successfully!') }
    })
    
    db.collection('medicineitems').createIndexes({
      code: 'text',
      medicineItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('medicineItems Indexes Created Successfully!') }
    })

    db.collection('accessoryitems').createIndexes({
      code: 'text',
      accessoryItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Accessory Items Indexes Created Successfully!') }
    })

    db.collection('procedureitems').createIndexes({
      code: 'text',
      procedureItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Items Indexes Created Successfully!') }
    })

    db.collection('procedureaccessories').createIndexes({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Accessories Indexes Created Successfully!') }
    })

    db.collection('proceduremedicines').createIndexes({
      code: 'text',
      name: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Procedure Medicine Indexes Created Successfully!') }
    })

    db.collection('medicinelists').createIndexes({
      code: 'text',
      procedureItemName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Medicine Lists Indexes Created Successfully!') }
    })

    db.collection('treatments').createIndexes({
      treatmentCode: 'text',
      treatmentName: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment Indexes Created Successfully!') }
    })

    db.collection('treatmentselections').createIndexes({
      code: 'text',
      selectionStatus: 'text'
    }, function (err, result) {
      if (err) { console.log(err) } else { console.log('Treatment Indexes Created Successfully!') }
    })
  });
}

