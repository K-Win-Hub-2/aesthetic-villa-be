"use strict"

const { createBooking, listAllBooking, getBookingById, updateBookingById, deleteBooking } = require("../controllers/bookingController")
const { listAllTreatmentsInBooking, getTreatmentInBooking } = require("../controllers/serviceAndSaleController")
const { catchError } = require("../lib/errorHandler")
const kwinMarketPlace = require("../controllers/kwinMarketPlaceController");

module.exports = (app) =>{
    //to get all treatment detail
    app.route("/api/market-place/services")
    .get(catchError(kwinMarketPlace.listAllProduct))
    
    //to get treatment detail by id
    app.route("/api/market-place/services/:id")
       .get(catchError(kwinMarketPlace.listAllProductById))

    //  to get appointment data
     app.route("/api/market-place/booking/services")
        .get(catchError(listAllBooking))
    
    //  to get specific appointment data by id 
    app.route("/api/market-place/services/booking/:id")
       .get(catchError(getBookingById))
       .put(catchError(updateBookingById))
       .delete(catchError(deleteBooking))

    // to post appointment and booking datas from user
    app.route("/api/market-place/appointments")
       .post(catchError(createBooking))

    
}