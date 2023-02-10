"use strict";

var _prisma = require("../lib/prisma");
var _zod = require("zod");
var _dayjs = _interopRequireDefault(require("dayjs"));
require("dayjs/locale/pt-br");
var _timezone = _interopRequireDefault(require("dayjs/plugin/timezone"));
var _utc = _interopRequireDefault(require("dayjs/plugin/utc"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
_dayjs.default.locale('pt-br');
_dayjs.default.extend(_utc.default);
_dayjs.default.extend(_timezone.default);
let currentHourToSaveMessage;
const getAllMessages = async () => {
  const time = (0, _dayjs.default)();
  const hour = time.tz('America/Sao_Paulo').utc(true).toString();
  const oneHourAgo = (0, _dayjs.default)().tz('America/Sao_Paulo').utc(true).subtract(1, 'hour').toString();
  // console.log(new Date(hour).toISOString());
  // console.log(new Date(oneHourAgo).toISOString());

  const data = await _prisma.prisma.message.findMany({
    where: {
      sentAt: {
        lte: new Date(hour).toISOString(),
        gte: new Date(oneHourAgo).toISOString()
      }
    }
  });

  // console.log(data);

  if (data.length > 0) {
    return data;
  }
};
const saveMessage = async data => {
  const saveMessageOnDataBase = _zod.z.object({
    message: _zod.z.string(),
    author: _zod.z.string()
  });
  const {
    author,
    message
  } = saveMessageOnDataBase.parse(data);
  const time = (0, _dayjs.default)();
  currentHourToSaveMessage = time.tz('America/Sao_Paulo').utc(true).format();
  await _prisma.prisma.message.create({
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
const getSavedMessage = async data => {
  const searchMessageOnDatabase = _zod.z.object({
    message: _zod.z.string(),
    author: _zod.z.string()
  });
  const {
    author,
    message
  } = searchMessageOnDatabase.parse(data);
  const searchMessage = await _prisma.prisma.message.findFirst({
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