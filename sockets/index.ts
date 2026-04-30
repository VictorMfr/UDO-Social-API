import { Socket } from "socket.io";
import { userHandler } from "./handlers/user.handler";
import { chatHandler } from "./handlers/chat.handler";

const onlineUsers = new Map<number, string>();

export const serverSocketsInitialize = (socket: Socket) => {
    userHandler(socket, onlineUsers);
    chatHandler(socket, onlineUsers);
};