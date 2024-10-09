const jwt = require('jsonwebtoken');
const CONFIG = require('../../config/db');

function verifyToken(req, res, next) {
  const authorization=req.headers['authorization'];
  if (!authorization){
  return res.status(401).send({ auth: false, message: 'No token provided.' });
}
  const token = req.headers['authorization'].replace('Bearer ', '');

  jwt.verify(token, CONFIG.jwtSecret, function (err, decoded) {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: 'Failed to authenticate token.' });
    }
    // if everything good, save to request for use in other routes
    let credentials = decodedCredentials(decoded);
    req['credentials'] = credentials;
    next();
  });
}

function decodedCredentials(decoded) {
  let credentials = decoded.credentials.split(`.${CONFIG.jwtKey}.`);
  const returnThisCredential = {
    id: credentials[0],
    email: credentials[1]
  }
  return returnThisCredential;
}

module.exports = verifyToken;


