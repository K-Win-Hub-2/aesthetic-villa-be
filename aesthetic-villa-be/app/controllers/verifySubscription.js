const { default: axios } = require("axios");
const Setting = require("../models/setting");

async function verifySubscription (req,res,next){
    const setting = await Setting.find();
    const deal = setting[0].deal;
    await axios.post("http://crmbackend.kwintechnologies.com:3500/api/verify-app-accessibility",{
        "deal": deal
    }).then(result=> result.data.data.isAccessible === true ? next() :  res.status(500).send({ error: true, message: 'Please Purchase Subscription Plan' }))
}

module.exports = verifySubscription;