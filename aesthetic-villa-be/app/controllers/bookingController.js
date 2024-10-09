const Booking = require("../models/booking")

exports.createBooking = async(req,res,next) => {
    try {
      let data = req.body
      let booking = new Booking(data)
      await booking.save()
      res.status(200).send({
        message: "Booking is created Successfully",
        status: "SUCCESS",
        success: true,
        data: booking
      })
    } catch(error){
      res.status(200).send({
        error: true,
        status: "Fail",
        message: error.message
      })
    }   
}

exports.listAllBooking = async (req,res,next) => {
    try {
      let query = { isDeleted: false }
      let queryBooking = await Booking.find(query).populate([{
                                                            path:"service",
                                                            populate:[
                                                                { path:"treatmentName" },
                                                                { path:"relatedDoctor" },
                                                                {path:"procedureMedicine", populate:{path: "item_id"}},
                                                                {path:"procedureAccessory", populate:{path: "item_id"}},
                                                                {path:"medicineLists", populate:{path: "item_id"}}     
                                                            ]
                                                             },
                                                            {
                                                             path:"serviceProvider"
                                                            }
                                                        ])
      if (queryBooking) 
           {
            return res.status(200).send({
                                         status: "SUCCESS",
                                         success: true,
                                         data: queryBooking
                                        })
            }

       else {
            return res.status(200).send({
                status: "SUCCESS",
                success: true,
                data: "There is no booking detail"
            })
       }
    }
    catch(error){
        res.status(200).send({
            error: true,
            status: "Fail",
            message: error.message
          })
    }
}

exports.getBookingById = async (req,res,next) => {
    try {
      let { id } = req.params;
      console.log("thisi is",id)
      let queryBookingById = await Booking.findOne({_id: id}).populate([{
                                                            path:"service",
                                                            populate:[
                                                                { path:"treatmentName" },
                                                                { path:"relatedDoctor" },
                                                                {path:"procedureMedicine", populate:{path: "item_id"}},
                                                                {path:"procedureAccessory", populate:{path: "item_id"}},
                                                                {path:"medicineLists", populate:{path: "item_id"}}     
                                                            ]
                                                             },
                                                            {
                                                             path:"serviceProvider"
                                                            }
                                                        ])
      return res.status(200).send({
                                    status: "SUCCESS",
                                    success: true,                
                                    data: queryBookingById              
                                   })                
    }
    catch(error){
        res.status(200).send({
            error: true,
            status: "Fail",
            message: error.message
          })
    }
}

exports.updateBookingById = async (req,res,next) => {
    try {
      let { id } = req.params;
      let data = req.body
      let updateBookingById = await Booking.findByIdAndUpdate(id,data)
      let updatedBookingById = await Booking.findById(id).populate([{
                                                                    path:"service",
                                                                    populate:[
                                                                        { path:"treatmentName" },
                                                                        { path:"relatedDoctor" },
                                                                        {path:"procedureMedicine", populate:{path: "item_id"}},
                                                                        {path:"procedureAccessory", populate:{path: "item_id"}},
                                                                        {path:"medicineLists", populate:{path: "item_id"}}     
                                                                    ]
                                                                    },
                                                                    {
                                                                    path:"serviceProvider"
                                                                    }
                                                                ])
      return res.status(200).send({
                                    status: "Updated Successfully",
                                    success: true,
                                    data: updatedBookingById                
                                  })                
    }                
    catch(error){
        res.status(200).send({
            error: true,
            status: "Fail",
            message: error.message
          })
    }
}

exports.deleteBooking = async (req,res,next) => {
   try {
    let { id } = req.params;
    let deleteBookingById = await Booking.findByIdAndDelete(id)
    return res.status(200).send({
                                  status: "Deleted Successfully",
                                  success: true             
                                })                
  }                
  catch(error){
      res.status(200).send({
          error: true,
          status: "Fail To Delete",
          message: error.message
        })
  }
}