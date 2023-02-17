import './styles/global.css';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';
import { Home } from './pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as socketIO from 'socket.io-client';

export function App() {
  const token = sessionStorage.getItem('token');
  const socket = socketIO.connect('http://localhost:2001', {
    query: {
      token: token
    }
  });


  return (
    <div className="App">
      <Router>
        <Routes>
          <Route  path="/" element={<Home />} />
          <Route  path="/login" element={<Login />} />
          <Route  path="/chat" element={<Chat socket={socket} />} />
        </Routes>
      </Router>
    </div>
  )
}
