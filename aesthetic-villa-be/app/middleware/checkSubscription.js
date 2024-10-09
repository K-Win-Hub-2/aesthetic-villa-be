const { Api } = require("../../config/api")
const setting = require("../models/setting")

exports.checkSubscription = async (req,res,next) => {
    try{
        let settings = await setting.find({})
        let result = await Api.post("verify-app-accessibility", {
            deal: settings[0].deal
        })
        if(result.data.data){
            let isAccessible = result.data.data.isAccessible
            isAccessible ? next() : res.status(401).send({
                error: true,
                message: "Subscription Required"
            })
        }else {
            res.status(500).send({
                error: true,
                message: "Something went wrong"
            })
        }
    }catch(error){
        res.status(500).send({
            error: true,
            message: error.message
        })
    }
}