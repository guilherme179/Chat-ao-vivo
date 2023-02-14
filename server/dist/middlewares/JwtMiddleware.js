"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verify = async (request, response, next) => {
    const authorization = request.headers['authorization'];
    var token;
    if (authorization !== undefined) {
        token = authorization.substring(7, authorization.length);
    }
    else {
        return response.status(401).end();
    }
    jsonwebtoken_1.default.verify(token, 'a4639bcc6786cf0f399675b012892ead', (err, _decoded) => {
        if (err)
            return response.status(401).send(err);
        next();
    });
};
module.exports = {
    verify,
};
