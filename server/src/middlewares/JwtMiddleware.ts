import jwt from "jsonwebtoken";

const verify = async (request, response, next) => {
  const authorization = request.headers['authorization'];
  var token;
  if (authorization !== undefined){
    token = authorization.substring(7, authorization.length);
  } else {
    return response.status(401).end();
  }

  jwt.verify(token, 'a4639bcc6786cf0f399675b012892ead', (err, _decoded) => {
    if(err) return response.status(401).send(err);
    
    next();
  });
}

module.exports = {
  verify,
};