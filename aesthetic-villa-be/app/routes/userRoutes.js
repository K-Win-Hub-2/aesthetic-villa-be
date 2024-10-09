'use strict';

const user = require('../controllers/userController');
const { catchError } = require('../lib/errorHandler');
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {
  app
    .route('/api/user')
    .post(  verifyToken, catchError(user.createUser))
    .put( verifyToken, catchError(user.updateUser));

  app
    .route('/api/user/:id')
    .get( verifyToken, catchError(user.getUserDetail))
    .delete( verifyToken, catchError(user.deleteUser))
    .post( verifyToken, catchError(user.activateUser));

  app
    .route("/api/change")
    .post( verifyToken, user.checkPermissionToChangePassword, catchError(user.changePassword))

  app.route('/api/users').get( verifyToken, catchError(user.listAllUsers));

  app.route('/api/users/doctor').post(  verifyToken, catchError(user.createDoctor))
  //app.route('/api/users/admin').post(  ,verifyToken, catchError(user.createAdmin))
  app.route('/api/me').get(
    
    (req, res, next) => {
      req.params.id = req.credentials.userId;
      next();
    },
    verifyToken, catchError(user.getUserDetail),
  );
};
