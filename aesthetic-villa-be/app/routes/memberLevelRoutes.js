"use strict";

const memberLevel = require("../controllers/memberLevelController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require("../lib/verifyToken");

module.exports = (app) => {
  app
    .route("/api/memberLevel")
    .post(verifyToken, catchError(memberLevel.createMemberLevel))
    .put(verifyToken, catchError(memberLevel.updateMemberLevel));

  app
    .route("/api/memberLevel/:id")
    .get(verifyToken, catchError(memberLevel.getMemberLevel))
    .delete(verifyToken, catchError(memberLevel.deleteMemberLevel));
  app
    .route("/api/memberLevel")
    .get(verifyToken, catchError(memberLevel.listAllMemberLevel));
};
