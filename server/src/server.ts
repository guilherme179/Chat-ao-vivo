import express from "express";
import jwt from "jsonwebtoken";
import session from "express-session";

const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});;
const UserController = require('./controllers/UserController');
const MessagesController = require('./controllers/MessagesController');
const UserMiddleware = require('./middlewares/UserMiddleware');

app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
  app.use(cors());
  next();
});

app.post('/login', UserMiddleware.validateLoginData, UserController.login);
app.post('/register', UserMiddleware.validateRegisterData, UserController.register);

io.use(async (socket, next) => {
  try {
      // Obtém o token do cabeçalho de autorização
      const token = socket.handshake.query.token;

      // Verifica se o token é válido
      const decoded = jwt.verify(token, 'a4639bcc6786cf0f399675b012892ead');

      // Adiciona o usuário decodificado à propriedade do socket
      socket.user = decoded;

      // Continua com a conexão do socket
      next();
  } catch (error) {
      // Rejeita a conexão do socket
      return next(new Error('Autenticação falhou'));
  }
});

let connectedClients = [];
let usersWriting: string[] = [];

io.on('connection', async socket =>{
  
  const userAlreadyConnected = connectedClients.find(client => client.user === socket.user.user);
  if (!userAlreadyConnected) {
    connectedClients.push({ socket_id: socket.id, user: socket.user.user, socket: socket });
  }

  // console.log(connectedClients);

  socket.emit('previousMessage', await MessagesController.getAllMessages());
  
  const clientsToSend = connectedClients.map(client => ({ socket_id: client.socket_id, user: client.user }));
  io.emit('connectedClients', clientsToSend);

  socket.on('sendMessage', async (data: any) => {   
    await MessagesController.saveMessage(data);
      
    // socket.broadcast.emit('receivedMessage', await MessagesController.getSavedMessage(data));
    // socket.emit('receivedMessage', await MessagesController.getSavedMessage(data));

    io.emit('receivedMessage', await MessagesController.getSavedMessage(data));
  });

  socket.on('writing', (user: string) => {
    if (!usersWriting.includes(user)) {
      usersWriting.push(user);
    }
    socket.broadcast.emit('userWriting', usersWriting);
  });

  socket.on('stopWriting', (user: string) => {
    usersWriting = usersWriting.filter((u) => u !== user);
    if(usersWriting.length === 0){
      io.emit('userStopingWriting');
    }else{
      io.emit('userWriting', usersWriting);
    }
  });

  socket.on('writingPrivate', (msg: string, user: string) => {
    const toUser = connectedClients.find(client => client.user == user);
    
    if (toUser) {
      // console.log('toUser.socket:', toUser.socket);
      
      if (toUser.socket) {
        // Verifica se o objeto socket existe antes de tentar usá-lo para enviar a mensagem.
        toUser.socket.emit('userWritingPrivate', msg);
        console.log(toUser);
      }
    }
  });

  socket.on('disconnect', () => {
    // console.log('desconectado: ' + socket.id);
  
    //Remove o ID do socket desconectado do array
    connectedClients = connectedClients.filter(client => client.socket_id !== socket.id);

    const clientsToSend = connectedClients.map(client => ({ socket_id: client.socket_id, user: client.user }));
    io.emit('connectedClients', clientsToSend);
  });
});

server.listen(2001);