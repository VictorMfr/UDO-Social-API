// socket.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // O tu URL de frontend
        }
    });

    io.on("connection", (socket: any) => {
        console.log("Nuevo cliente conectado:", socket.id);

        socket.on("join_room", (conversationId: string) => {
            socket.join(`room_${conversationId}`);
        });

        socket.on("disconnect", () => {
            console.log("Cliente desconectado");
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io no ha sido inicializado");
    }
    return io;
};