const axios = require("axios")

exports.Api =  axios.create({
    baseURL: "http://crmbackend.kwintechnologies.com:3500/api/",
    headers: {
        "Content-Type": "application/json",
    }
})