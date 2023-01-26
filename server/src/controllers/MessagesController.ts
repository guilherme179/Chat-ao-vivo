import { prisma } from "../lib/prisma";
import { z } from 'zod';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.locale('pt-br');
dayjs.extend(utc);
dayjs.extend(timezone);

let currentHourToSaveMessage: any ;

const getAllMessages = async () => {
  const time = dayjs();
  const hour = time.tz('America/Sao_Paulo').utc(true).toString();
  const oneHourAgo = dayjs().tz('America/Sao_Paulo').utc(true).subtract(1, 'hour').toString();
  // console.log(new Date(hour).toISOString());
  // console.log(new Date(oneHourAgo).toISOString());

  const data = await prisma.message.findMany({
    where: {
      sentAt: {
        lte: new Date(hour).toISOString(),
        gte: new Date(oneHourAgo).toISOString(),
      }
    }
  });

  // console.log(data);

  if(data.length > 0){
    return data;
  }
}

const saveMessage = async (data) => {
  const saveMessageOnDataBase = z.object({
    message: z.string(),
    author: z.string()
  });

  const { author, message } = saveMessageOnDataBase.parse(data);

  const time = dayjs();
  currentHourToSaveMessage = time.tz('America/Sao_Paulo').utc(true).format();

  await prisma.message.create({
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
}

const getSavedMessage = async (data) => {
  const searchMessageOnDatabase = z.object({
    message: z.string(),
    author: z.string()
  });

  const { author, message } = searchMessageOnDatabase.parse(data);

  const searchMessage = await prisma.message.findFirst({
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
}