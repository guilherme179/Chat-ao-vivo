"use strict";

const validateLoginData = async (request, response, next) => {
  const {
    body
  } = request;
  if (body.login === undefined || body.password === undefined) {
    return response.status(400).json({
      message: 'you must pass all fields!'
    });
  }
  if (body.login === '' || body.password === '') {
    return response.status(400).json({
      message: 'need to fill in all fields!'
    });
  }
  next();
};
const validateRegisterData = async (request, response, next) => {
  const {
    body
  } = request;
  if (body.login === undefined || body.password === undefined || body.email === undefined || body.username === undefined) {
    return response.status(400).json({
      message: 'you must pass all fields!'
    });
  }
  if (body.login === '' || body.password === '' || body.email === '' || body.username === '') {
    return response.status(400).json({
      message: 'need to fill in all fields!'
    });
  }
  next();
};
module.exports = {
  validateLoginData,
  validateRegisterData
};