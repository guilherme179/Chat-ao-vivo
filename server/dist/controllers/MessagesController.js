"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
const dayjs_1 = __importDefault(require("dayjs"));
require("dayjs/locale/pt-br");
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.locale('pt-br');
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
let currentHourToSaveMessage;
const getAllMessages = async () => {
    const time = (0, dayjs_1.default)();
    const hour = time.tz('America/Sao_Paulo').utc(true).toString();
    const oneHourAgo = (0, dayjs_1.default)().tz('America/Sao_Paulo').utc(true).subtract(1, 'hour').toString();
    const data = await prisma_1.prisma.message.findMany({
        where: {
            sentAt: {
                lte: new Date(hour).toISOString(),
                gte: new Date(oneHourAgo).toISOString(),
            }
        }
    });
    if (data.length > 0) {
        return data;
    }
};
const saveMessage = async (data) => {
    const saveMessageOnDataBase = zod_1.z.object({
        message: zod_1.z.string(),
        author: zod_1.z.string()
    });
    const { author, message } = saveMessageOnDataBase.parse(data);
    const time = (0, dayjs_1.default)();
    currentHourToSaveMessage = time.tz('America/Sao_Paulo').utc(true).format();
    await prisma_1.prisma.message.create({
        data: {
            user: {
                connect: {
                    username: author
                }
            },
            text: message,
            sentAt: currentHourToSaveMessage
        }
    });
};
const getSavedMessage = async (data) => {
    const searchMessageOnDatabase = zod_1.z.object({
        message: zod_1.z.string(),
        author: zod_1.z.string()
    });
    const { author, message } = searchMessageOnDatabase.parse(data);
    const searchMessage = await prisma_1.prisma.message.findFirst({
        where: {
            author: author,
            text: message,
            sentAt: currentHourToSaveMessage
        }
    });
    return searchMessage;
};
module.exports = {
    getAllMessages,
    saveMessage,
    getSavedMessage
};
