import { User, Lock } from "phosphor-react";
import { useState } from "react";
import { api } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export function Login () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();


  async function submit(e: Event){
    e.preventDefault();

    const auth = await api.post('login', {
      'login': username,
      'password': password
    });

    console.log(auth);

    if(auth.status === 202){
      setUsername('');
      setPassword('');
      const decode = jwt_decode(auth.data.token);
      sessionStorage.setItem('token', auth.data.token);
      sessionStorage.setItem('exp', decode.exp);
      navigate("/chat");
    } else {

    }
  }

  return(
    <div className="bg-login-800 h-screen flex justify-center flex-col items-center">
      <div className="flex flex-row bg-login-700 rounded-md mb-3">
        <div className="flex self-center">
          <label htmlFor="username" className="px-5 py-4">
            <User size={25} className="flex justify-center" color="#606468"/>
          </label>
        </div>

        <input type="text" name="username" id="username" placeholder="Username" className="w-60 rounded-r-md bg-login-600 p-4 text-white focus:outline-none hover:bg-login-500 focus:bg-login-500" value={username} onChange={e => {setUsername(e.target.value)}}/>
      </div>
      <div className="flex flex-row bg-login-700 rounded-md mb-3">
        <div className="flex self-center">
          <label htmlFor="password"  className="px-5 py-4">
            <Lock size={25} className="flex justify-center" color="#606468"/>
          </label>
        </div>

        <input type="password" name="password" id="password" placeholder="Password" className="w-60 rounded-r-md bg-login-600 p-4 text-white focus:outline-none hover:bg-login-500 focus:bg-login-500" value={password} onChange={e => {setPassword(e.target.value)}}/>
      </div>
      <button type="submit" className="w-[305px] h-14 bg-green-800 text-white hover:bg-green-700 focus:bg-green-700 rounded-md text-lg font-semibold" onClick={submit}> Logar </button>
    </div>
  )
}