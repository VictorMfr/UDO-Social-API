import { Socket } from "socket.io";
import { io } from "..";

export const serverSocketsInitialize = (socket: Socket) => {
    console.log('Usuario conectado')

    // Aqui es donde se podra registrar los eventos del socket (usuarios en cuestion)
    // io = Comandos del servidor | socket = Comandos del usuario

    socket.on('join_conversation', (conversationId) => {
        socket.join(`chat_${conversationId}`);
    });

    // En tu serverSocketsInitialize o similar
    socket.on('typing_message', (data) => {
        // .to() envía a todos en la sala, .broadcast.to() envía a todos MENOS al que emitió
        socket.broadcast.to(`chat_${data.conversationId}`).emit('user_typing_message');
    });

    socket.on('stop_typing_message', (data) => {
        socket.broadcast.to(`chat_${data.conversationId}`).emit('user_stopped_typing');
    });

    socket.on('disconnect', (socket) => {
        console.log('Usuario sale de la sesion');
    });
}