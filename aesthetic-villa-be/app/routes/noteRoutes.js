"use strict";

const note = require("../controllers/noteController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/note')
        .post(verifyToken, catchError(note.createNote))
        .put(verifyToken, catchError(note.updateNote))

    app.route('/api/note/:id')
        .get(verifyToken, catchError(note.getNote))
        .delete(verifyToken, catchError(note.deleteNote))
        .post(verifyToken, catchError(note.activateNote))

    app.route('/api/notes').get(verifyToken, catchError(note.listAllNotes))
    app.route('/api/notes/get-notes').get(verifyToken, catchError(note.getNotesByAccounts))

};
