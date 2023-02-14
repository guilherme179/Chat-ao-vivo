"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (request, response) => {
    const getClientBody = zod_1.z.object({
        login: zod_1.z.string().min(3).max(30).nonempty(),
        password: zod_1.z.string().min(8).max(30).nonempty(),
    });
    try {
        const clientBody = getClientBody.parse(request.body);
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                login: clientBody.login,
            }
        });
        const isPasswordValid = await bcrypt_1.default.compare(clientBody.password, user.password);
        if (isPasswordValid) {
            const expiredAt = Math.floor(Date.now() / 1000) + 86400;
            const token = jsonwebtoken_1.default.sign({ user: user.username, id: user.id, exp: expiredAt }, 'a4639bcc6786cf0f399675b012892ead', { algorithm: 'HS256' });
            return response.status(202).json({ token: token });
        }
        else {
            return response.status(401).send('Incorrect login or password');
        }
    }
    catch (error) {
        if (error.message.includes("user not found")) {
            return response.status(401).json({
                message: "Incorrect login or password."
            });
        }
        return response.status(400).json({ message: error.message });
    }
};
const register = async (request, response) => {
    const getClientBody = zod_1.z.object({
        login: zod_1.z.string().min(3).max(30).nonempty(),
        password: zod_1.z.string().min(8).max(30).nonempty(),
        email: zod_1.z.string().email().nonempty(),
        username: zod_1.z.string().min(3).max(50).nonempty(),
    });
    try {
        const clientBody = getClientBody.parse(request.body);
        const hashedPassword = await bcrypt_1.default.hash(clientBody.password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                login: clientBody.login,
                password: hashedPassword,
                email: clientBody.email,
                username: clientBody.username
            }
        });
        return response.status(201).json({ user });
    }
    catch (error) {
        if (error.message.includes("unique")) {
            return response.status(409).json({
                message: `${error.message.split(".")[0]} already exist.`
            });
        }
        return response.status(400).json({ message: error.message });
    }
};
module.exports = {
    login,
    register
};
