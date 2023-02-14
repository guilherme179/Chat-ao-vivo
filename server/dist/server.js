"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
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
const UserController = require('./controllers/UserController');
const MessagesController = require('./controllers/MessagesController');
const UserMiddleware = require('./middlewares/UserMiddleware');
app.use((0, express_session_1.default)({
    secret: 'my secret',
    resave: false,
    saveUninitialized: true
}));
app.use(express_1.default.json());
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
        const token = socket.handshake.query.token;
        const decoded = jsonwebtoken_1.default.verify(token, 'a4639bcc6786cf0f399675b012892ead');
        socket.user = decoded;
        next();
    }
    catch (error) {
        return next(new Error('Autenticação falhou'));
    }
});
let connectedClients = [];
io.on('connection', async (socket) => {
    const userAlreadyConnected = connectedClients.find(client => client.user === socket.user.user);
    if (!userAlreadyConnected) {
        connectedClients.push({ socket_id: socket.id, user: socket.user.user, socket: socket });
    }
    console.log(connectedClients);
    socket.emit('previousMessage', await MessagesController.getAllMessages());
    io.emit('connectedClients', connectedClients);
    socket.on('sendMessage', async (data) => {
        await MessagesController.saveMessage(data);
        io.emit('receivedMessage', await MessagesController.getSavedMessage(data));
    });
    socket.on('writing', (msg) => {
        socket.broadcast.emit('userWriting', msg);
    });
    socket.on('writingPrivate', (msg, user) => {
        const toUser = connectedClients.find(client => client.user == user);
        if (toUser) {
            console.log('toUser.socket:', toUser.socket);
            if (toUser.socket) {
                toUser.socket.emit('privateMessage', msg);
                console.log('olá');
            }
        }
    });
    socket.on('disconnect', () => {
        console.log('desconectado: ' + socket.id);
        connectedClients = connectedClients.filter(client => client.socket_id !== socket.id);
        io.emit('connectedClients', connectedClients);
    });
});
server.listen(2001);
