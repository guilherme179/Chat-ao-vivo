"use strict";

var _prisma = require("../lib/prisma");
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _zod = require("zod");
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const login = async (request, response) => {
  // Validate request body
  const getClientBody = _zod.z.object({
    login: _zod.z.string().min(3).max(30).nonempty(),
    password: _zod.z.string().min(8).max(30).nonempty()
  });
  try {
    const clientBody = getClientBody.parse(request.body);

    // Find the user by login
    const user = await _prisma.prisma.user.findFirst({
      where: {
        login: clientBody.login
      }
    });
    const isPasswordValid = await _bcrypt.default.compare(clientBody.password, user.password);

    // Check if password is valid
    if (isPasswordValid) {
      const expiredAt = Math.floor(Date.now() / 1000) + 86400;
      const token = _jsonwebtoken.default.sign({
        user: user.username,
        id: user.id,
        exp: expiredAt
      }, 'a4639bcc6786cf0f399675b012892ead', {
        algorithm: 'HS256'
      });
      return response.status(202).json({
        token: token
      });
    } else {
      return response.status(401).send('Incorrect login or password');
    }
  } catch (error) {
    // handle error
    if (error.message.includes("user not found")) {
      return response.status(401).json({
        message: "Incorrect login or password."
      });
    }
    return response.status(400).json({
      message: error.message
    });
  }
};
const register = async (request, response) => {
  // Validate request body
  const getClientBody = _zod.z.object({
    login: _zod.z.string().min(3).max(30).nonempty(),
    password: _zod.z.string().min(8).max(30).nonempty(),
    email: _zod.z.string().email().nonempty(),
    username: _zod.z.string().min(3).max(50).nonempty()
  });
  try {
    const clientBody = getClientBody.parse(request.body);
    // Hash the password
    const hashedPassword = await _bcrypt.default.hash(clientBody.password, 10);
    // Create a new user
    const user = await _prisma.prisma.user.create({
      data: {
        login: clientBody.login,
        password: hashedPassword,
        email: clientBody.email,
        username: clientBody.username
      }
    });
    return response.status(201).json({
      user
    });
  } catch (error) {
    // handle error
    if (error.message.includes("unique")) {
      return response.status(409).json({
        message: `${error.message.split(".")[0]} already exist.`
      });
    }
    return response.status(400).json({
      message: error.message
    });
  }
};
module.exports = {
  login,
  register
};