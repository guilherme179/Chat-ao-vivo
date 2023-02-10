import { api } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import * as socketIO from 'socket.io-client';
import jwt_decode from "jwt-decode";
import moment from "moment";

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
  const exp = sessionStorage.getItem('exp');
  const now = Math.floor(Date.now() / 1000);
  const navigate = useNavigate();      
  
  const [username, setUsername] = useState(''); 
  const [yourMessage, setYourMessage] = useState(''); 
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  interface Message {
    author: string;
    sentAt: string;
    text: string;
  }

  socket.socket.on('receivedMessage', (message: Message) => { 
    setMessages([...messages, message]);
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
    if(token == '' || token == null) navigate("/login");
    else{
      const decode: any = jwt_decode(token);
      setUsername(decode.user);
    }  
    if(exp !== null && Number(exp) < now) navigate("/login");
    else if(exp == null) navigate("/login");

    
    socket.socket.on('previousMessage', (messages: Message) => {
      if (Array.isArray(messages)) {
        setMessages(messages);
      } else {
        console.log(messages);
      }
    });
  }, [token, exp, now, navigate]);

  return(
    <div className="bg-login-800 h-screen w-screen flex justify-center flex-col items-center">
      <div className="w-full flex place-content-center">
        <input type="text" placeholder="Your username..." value={username} onChange={(e) => { setUsername(e.target.value) }} className="bg-login-700 w-2/5 flex text-center p-3 rounded-md outline-none focus:border-zinc-300 focus:border text-zinc-300 text-xl mb-5"/>
      </div>
      <div className="w-2/5 h-[400px] m-[20px 0] bg-login-700 rounded-md border text-zinc-400 border-zinc-400 border-solid p-5 overflow-y-scroll" id="chat">
        { messages.map((message: Message, i) =>{
          console.log(lastUserMessage != message.author);
          console.log(lastUserMessage);
          console.log(message.author);
          if(lastUserMessage != message.author){
            setLastUserMessage(message.author);
            return (
              <p key={i}>
                {<strong>{message.author.toUpperCase()}</strong>} {moment(message.sentAt).format("DD/MM/YYYY HH:mm")}: {message.text}
              </p>
            );
          } else {
            return (
              <p key={i}>
                {moment(message.sentAt).format("DD/MM/YYYY HH:mm")}: {message.text}
              </p>
            );
          }
        })}
      </div>
      <div className="w-full flex place-content-center">
        <input type="text" placeholder="Your message..." value={yourMessage} onChange={(e) => { setYourMessage(e.target.value) }}  className="bg-login-700 w-[33%] flex text-center p-3 rounded-md outline-none focus:border-zinc-300 focus:border text-zinc-300 text-xl mt-5"/>
        <button className="bg-green-600 w-[5%] flex justify-center items-center p-3 ml-[2%] rounded-md outline-none hover:bg-green-500 text-white text-base mt-5" onClick={submit} >Submit</button>
      </div>
    </div>
  )
}