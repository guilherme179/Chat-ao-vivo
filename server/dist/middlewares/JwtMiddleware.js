"use strict";

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const verify = async (request, response, next) => {
  const authorization = request.headers['authorization'];
  var token;
  if (authorization !== undefined) {
    token = authorization.substring(7, authorization.length);
  } else {
    return response.status(401).end();
  }
  _jsonwebtoken.default.verify(token, 'a4639bcc6786cf0f399675b012892ead', (err, _decoded) => {
    if (err) return response.status(401).send(err);
    next();
  });
};
module.exports = {
  verify
};