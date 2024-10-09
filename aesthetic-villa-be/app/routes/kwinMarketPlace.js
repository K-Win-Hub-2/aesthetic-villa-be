"use strict";

const kwinMarketPlace = require("../controllers/kwinMarketPlaceController");
const { catchError } = require("../lib/errorHandler");

module.exports = (app) => {
    //k win market route for subcategories
    app.route('/api/market-place/categories/:id')
        .get(catchError(kwinMarketPlace.listCategoryById))
    //kwin  market route for categories list
    app.route('/api/market-place/categories').get(catchError(kwinMarketPlace.listAllTreatmentUnit))
    //kwin  market route for sub categories list
    app.route('/api/market-place/subcategories/:id').get(catchError(kwinMarketPlace.listAllTreatmentSubCategoriesById))
    //kwin  market route for sub categories list
    app.route('/api/market-place/subcategories').get(catchError(kwinMarketPlace.listAllTreatmentSubCategories))
    //kwin  market route for sub categories list
    app.route('/api/market-place/medicinelists/:id').get(catchError(kwinMarketPlace.listAllMedicineListById))
    //kwin  market route for sub categories list
    app.route('/api/market-place/medicinelists').get(catchError(kwinMarketPlace.listAllMedicineList))
    //kwin  market route for categories list
    app.route('/api/market-place/products').get(catchError(kwinMarketPlace.listAllProduct))
    //kwin  market route for categories list
    app.route('/api/market-place/products/:id').get(catchError(kwinMarketPlace.listAllProductById))

};
