"use strict";

var _express = _interopRequireDefault(require("express"));
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _expressSession = _interopRequireDefault(require("express-session"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const app = (0, _express.default)();
const cors = require('cors');
const bodyParser = require('body-parser');
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
;
const UserController = require("./controllers/UserController");
const MessagesController = require("./controllers/MessagesController");
const UserMiddleware = require("./middlewares/UserMiddleware");
app.use((0, _expressSession.default)({
  secret: 'my secret',
  resave: false,
  saveUninitialized: true
}));
app.use(_express.default.json());
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
    const decoded = _jsonwebtoken.default.verify(token, 'a4639bcc6786cf0f399675b012892ead');

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
io.on('connection', async socket => {
  const userAlreadyConnected = connectedClients.find(client => client.user === socket.user.user);
  if (!userAlreadyConnected) {
    connectedClients.push({
      socket_id: socket.id,
      user: socket.user.user
    });
  }
  console.log(connectedClients);
  socket.emit('previousMessage', await MessagesController.getAllMessages());
  socket.on('sendMessage', async data => {
    await MessagesController.saveMessage(data);

    // socket.broadcast.emit('receivedMessage', await MessagesController.getSavedMessage(data));
    // socket.emit('receivedMessage', await MessagesController.getSavedMessage(data));
    io.emit('receivedMessage', await MessagesController.getSavedMessage(data));
  });
  io.on('disconnect', socket => {
    //Remove o ID do socket desconectado do array
    connectedClients = connectedClients.filter(client => client.socket_id !== socket.id);
    // Desconecta o usuário
    io.sockets.connected[socket.id].disconnect();
  });
});
server.listen(2001);