"use strict";

const member = require("../controllers/memberController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/member')
        .post( verifyToken, catchError(member.createMember))
        .put( verifyToken, catchError(member.updateMember))

    app.route('/api/member/:id')
        .get( verifyToken, catchError(member.getMember))
        .delete( verifyToken, catchError(member.deleteMember))
        .post( verifyToken, catchError(member.activateMember))

    app.route('/api/members').get( verifyToken, catchError(member.listAllMembers))

};
