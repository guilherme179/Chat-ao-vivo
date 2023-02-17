import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import * as socketIO from 'socket.io-client';

interface DefaultEventsMap {
  on: any;
  connect: any;
  disconnect: any;
  [key: string]: any;
}

interface ChatProps {
  socket: socketIO.Socket<DefaultEventsMap, DefaultEventsMap>;
}


export default function Header(socket: ChatProps) {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();   
  const token = sessionStorage.getItem('token'); 
  const exp = sessionStorage.getItem('exp');
  const now = Math.floor(Date.now() / 1000);  

  function logout() {
    socket.socket.disconnect();
    sessionStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    if(token == '' || token == null) navigate("/login");
    else{
      const decode: any = jwt_decode(token);
      setUsername(decode.user);
    }  
    if(exp !== null && Number(exp) < now) navigate("/login");
    else if(exp == null) navigate("/login");
  }, [token, exp, now, navigate]);
  
  return(
    <div className="w-full h-16 bg-login-700 flex flex-row">
      <div className="flex items-center w-2/3 justify-start">
        <img src="./src/img/Chat Online.svg" alt="logo" />
      </div>
      <div className="w-[24%] flex items-center justify-around">
        <p className="text-green-600 font-semibold text-lg">{username}</p>
        <button className="text-white font-semibold text-base" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}