import { useState, useEffect } from "react";
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

export function Chat (socket: ChatProps) {
  const token = sessionStorage.getItem('token');  
  
  const [username, setUsername] = useState(''); 
  const [yourMessage, setYourMessage] = useState(''); 
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

  socket.socket.on('receivedMessage', (message: Message) => { 
    setMessages([...messages, message]);
  });

  socket.socket.on('connectedClients', (connectedClientsArray: any) => { 
    setUsers(connectedClientsArray);
  });

  async function submit(e: React.FormEvent<HTMLInputElement>){
    e.preventDefault();

    if(yourMessage != null && yourMessage != ''){
      var messageObject = {
        author: username,
        message: yourMessage
      };

      socket.socket.emit('sendMessage', messageObject);

      setYourMessage('');
    }
  }

  useEffect(() => {
    const decode: any = jwt_decode(token);
    setUsername(decode.user);

    
    socket.socket.on('previousMessage', (messages: Message) => {
      if (Array.isArray(messages)) {
        setMessages(messages);
      } else {
        console.log(messages);
      }
    });

    socket.socket.on('connectedClients', (connectedClientsArray: any) => { 
      setUsers(connectedClientsArray);
    });
  }, [token]);

  return(
    <div className="bg-login-800 h-screen w-screen">
      <Header socket={socket.socket}/>
      <div className="flex justify-around mt-16">
        <div className="h-4/5 w-1/3 flex flex-col items-center justify-center">
          <div className="w-2/3 flex place-content-center bg-login-700 rounded-md rounded-b-none border text-zinc-400 border-zinc-400 border-solid">
            <p className="text-zinc-300 text-xl font-semibold">Lista de usuários conectados</p>
          </div>
          <div className="w-2/3 h-[400px] m-[20px 0] bg-login-700 rounded-md rounded-t-none border text-zinc-400 border-t-0 border-zinc-400 border-solid p-5 overflow-y-scroll" id="chat">
            { users.map((user: ConnectedClients, i) =>{
              return(
                <p key={i}>
                  {<strong>{user.user}</strong>}
                </p>
              );
            })}
          </div>  
        </div>
        <div className="h-4/5 w-2/3 flex flex-col items-center justify-center">
          <div className="w-full flex place-content-center">
            <input type="hidden" placeholder="Your username..." value={username} onChange={(e) => { setUsername(e.target.value) }} className="bg-login-700 w-2/5 flex text-center p-3 rounded-md outline-none focus:border-zinc-300 focus:border text-zinc-300 text-xl mb-5" disabled/>
          </div>
          <div className="w-3/5 h-[400px] m-[20px 0] bg-login-700 rounded-md border text-zinc-400 border-zinc-400 border-solid p-5 overflow-y-scroll" id="chat">
            { messages.map((message: Message, i) =>{
              return(
                <p key={i}>
                  {<strong>{message.author.toUpperCase()}</strong>} {dayjs(message.sentAt).utc().format("DD/MM/YYYY HH:mm")}: {message.text}
                </p>
              );
            })}
          </div>
          <div className="w-full flex place-content-center">
            <input type="text" placeholder="Your message..." value={yourMessage} onChange={(e) => { setYourMessage(e.target.value) }}  className="bg-login-700 w-[48%] flex text-center p-3 rounded-md outline-none focus:border-zinc-300 focus:border text-zinc-300 text-xl mt-5"/>
            <button className="bg-green-800 w-[10%] flex justify-center items-center p-3 ml-[2%] rounded-md outline-none hover:bg-green-700 text-white text-base mt-5" onClick={() => submit} >Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}