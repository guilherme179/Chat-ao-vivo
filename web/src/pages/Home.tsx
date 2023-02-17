import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Home () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return(
    <div className="bg-login-800 h-screen flex justify-center flex-col items-center">
      <p>Home</p>        
    </div>
  )
}