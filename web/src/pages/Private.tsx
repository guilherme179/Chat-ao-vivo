import { useState, useEffect, FormEvent } from "react";
import * as socketIO from 'socket.io-client';
import jwt_decode from "jwt-decode";
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Header from "./Header";

dayjs.locale('pt-br');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Sao_Paulo');

interface DefaultEventsMap {
  on: any;
  connect: any;
  disconnect: any;
  [key: string]: any;
}

interface ChatProps {
  socket: socketIO.Socket<DefaultEventsMap, DefaultEventsMap>;
}

export function Private ({ socket }: ChatProps) {
  const token = sessionStorage.getItem('token');  
  
  const [username, setUsername] = useState(''); 
  const [usernameToPrivate, setUsernameToPrivate] = useState(''); 
  const [yourMessage, setYourMessage] = useState(''); 
  const [broadcast, setBroadcast] = useState(''); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ConnectedClients[]>([]);

  interface Message {
    author: string;
    sentAt: string;
    text: string;
  }

  interface ConnectedClients {
    socket_id: string;
    user: string;
  }

  socket.on('receivedMessagePrivate', (message: Message) => { 
    setMessages([...messages, message]);
  });

  socket.on('connectedClients', (connectedClientsArray: any) => { 
    console.log(connectedClientsArray);
    setUsers(connectedClientsArray);
  });

  socket.on('userWritingPrivate', (msg: string) => { 
    console.log(msg);
    setBroadcast(msg);
  });

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if(yourMessage != null && yourMessage != ''){
      var messageObject = {
        author: username,
        message: yourMessage
      };

      socket.emit('sendMessagePrivate', messageObject);

      setYourMessage('');
    }
  }

  function handleYourMessage(message: string) {
    setYourMessage(message); 
    if(usernameToPrivate != null && usernameToPrivate != ''){
      if(message.length > 0){
        socket.emit('writingPrivate', username + ' is writing...', usernameToPrivate);
      } else { 
        socket.emit('writingPrivate', '', usernameToPrivate);
      }
    }
  }

  useEffect(() => {
    socket.on('connectedClients', (connectedClientsArray: any) => { 
      setUsers(connectedClientsArray);
    });
    
    socket.on('previousMessagePrivate', (messages: Message) => {
      if (Array.isArray(messages)) {
        setMessages(messages);
      }
    });
    
    if(token != null && token != ''){
      const decode: any = jwt_decode(token);
      setUsername(decode.user);
    }
  }, []);
  
  let lastAuthor = '';
  let lastDate: Date = new Date(0);
  let currentDate: Date;

  return(
    <div className="bg-login-800 h-screen w-screen">
      <Header socket={socket}/>
      <div className="flex justify-around mt-16">
        <div className="h-4/5 w-1/3 flex flex-col items-center justify-center">
          <div className="w-2/3 flex place-content-center bg-login-700 rounded-md rounded-b-none border text-zinc-400 border-zinc-400 border-solid">
            <p className="text-zinc-300 text-xl font-semibold">Lista de usuários conectados</p>
          </div>
          <div className="w-2/3 h-[462px] bg-login-700 rounded-md rounded-t-none border text-zinc-400 border-t-0 border-zinc-400 border-solid p-5 overflow-y-scroll" id="chat">
            { users.map((user: ConnectedClients, i) =>{
              if(user.user === username){
                return(
                  <p key={i}>
                    {<strong className="text-green-500 uppercase">{user.user}</strong>}
                  </p>
                );
              } else {
                return(
                  <p key={i}>
                    {<strong className="text-white uppercase">{user.user}</strong>}
                  </p>
                );
              }
            })}
          </div>  
        </div>
        <div className="h-4/5 w-2/3 flex flex-col items-center justify-center">
          <input type="hidden" placeholder="Your username..." value={username} onChange={(e) => { setUsername(e.target.value) }} disabled/>  
          <div className="w-full flex place-content-center">
            <input type="text" placeholder="Username to private message..." value={usernameToPrivate} onChange={(e) => { setUsernameToPrivate(e.target.value) }} className="bg-login-700 w-[60%] flex text-center p-3 rounded-md outline-none focus:border-zinc-300 focus:border text-zinc-300 text-xl mb-5"/>
          </div>
          <div className="w-3/5 h-[348px] bg-login-700 rounded-md border text-zinc-400 border-zinc-400 border-solid p-5 overflow-y-scroll" id="chat">
            { messages.map((message: Message, i) =>{
               if (message.author === username) {
                lastAuthor = '';
                return (
                  <p key={i} className="flex justify-end mt-2 mb-2">
                    {message.text} | {dayjs(message.sentAt).utc().format("HH:mm")}
                  </p>
                );
                }else{
                  currentDate = new Date(message.sentAt);
                  const timeDiffInMs: number = Math.abs(currentDate.getTime() - lastDate.getTime());
                  
                  if (message.author !== lastAuthor && timeDiffInMs > 10) {
                    lastAuthor = message.author;
                    lastDate = new Date(message.sentAt);
                    console.log(message.sentAt);
                    return(
                      <p key={i} className="max-w-[50%] whitespace-pre-wrap mt-2 mb-2">
                        {<strong>{message.author.toUpperCase()}</strong>} {dayjs(message.sentAt).utc().format("HH:mm")}: <br /> {message.text}
                      </p>
                    );
                  } else {
                    return (
                      <p key={i} className="max-w-[50%] whitespace-pre-wrap mt-2 mb-2">
                        {message.text}
                      </p>
                    );
                  }
                }
            })}
            <p className="flex items-end">{broadcast}</p>
          </div>
          <div className="w-full flex place-content-center">
            <input type="text" placeholder="Your message..." value={yourMessage} onChange={(e) => { handleYourMessage(e.target.value); }}  className="bg-login-700 w-[48%] flex text-center p-3 rounded-md outline-none focus:border-zinc-300 focus:border text-zinc-300 text-xl mt-5"/>
            <button className="bg-green-800 w-[10%] flex justify-center items-center p-3 ml-[2%] rounded-md outline-none hover:bg-green-700 text-white text-base mt-5" onClick={handleSubmit} >Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}