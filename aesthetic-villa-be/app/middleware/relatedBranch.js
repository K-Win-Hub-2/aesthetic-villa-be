// middleware.js
const relatedBranchMiddleware = (req, res, next) => {
    let query = {isDeleted: false}
    req.mongoQuery = query;
    next();
  };
  
  module.exports = { relatedBranchMiddleware };
  