"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.logger = exports.app = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const winston_1 = __importDefault(require("winston"));
const compression_1 = __importDefault(require("compression"));
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    // origin: ["http://localhost:5173"],
    origin: (origin, callback) => {
        if (origin) {
            callback(null, origin);
        }
        else {
            callback(null, '*');
        }
    },
    credentials: true,
    preflightContinue: false,
    allowedHeaders: ['sessionId', 'Content-Type'],
    exposedHeaders: ['sessionId'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
const allUsers = new Map();
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = socket.handshake.query.id;
    if (!userId)
        return;
    const existingUser = allUsers.get(userId);
    if (existingUser) {
        existingUser.count += 1;
    }
    else {
        allUsers.set(userId, { socket, count: 1 });
    }
    yield socket.join(`user-${userId}`);
    io.emit('roomJoined');
    io.emit('getOnlineUsers', Array.from(allUsers.keys()));
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = allUsers.get(userId);
        if (!userData)
            return;
        userData.count -= 1;
        if (userData.count <= 0) {
            allUsers.delete(userId);
        }
        else {
            allUsers.set(userId, userData);
        }
        io.emit('getOnlineUsers', Array.from(allUsers.keys()));
    }));
}));
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.simple(),
    transports: [new winston_1.default.transports.Console()],
});
exports.logger = logger;
