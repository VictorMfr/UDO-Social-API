import { Socket } from "socket.io";
import { Participant, Message, User } from "../../database/associations";

export const chatHandler = (socket: Socket, onlineUsers: Map<number, string>) => {
    socket.on('join_conversation', (conversationId: number) => {
        socket.join(`chat_${conversationId}`);
    });

    socket.on('typing_message', async (conversationId: number) => {
        // Obtener el userId del socket actual (quien está escribiendo)
        const currentUserId = Array.from(onlineUsers.entries()).find(([_, socketId]) => socketId === socket.id)?.[0];

        // Enviar a la sala del chat
        socket.to(`chat_${conversationId}`).emit('user_typing_message', { conversationId });

        // Enviar directamente al otro usuario
        try {
            const participants = await Participant.findAll({
                where: { conversation_id: conversationId },
                attributes: ['user_id'],
                raw: true
            });

            // Enviar a todos los participantes excepto al que escribe
            participants.forEach(p => {
                if (p.user_id !== currentUserId) {
                    socket.to(`user_${p.user_id}`).emit('user_typing_message', { conversationId });
                }
            });
        } catch (error) {
            console.error('Error al notificar typing:', error);
        }
    });

    socket.on('stop_typing_message', async (conversationId: number) => {
        // Obtener el userId del socket actual
        const currentUserId = Array.from(onlineUsers.entries()).find(([_, socketId]) => socketId === socket.id)?.[0];

        // Enviar a la sala del chat
        socket.to(`chat_${conversationId}`).emit('user_stopped_typing', { conversationId });

        // Enviar directamente al otro usuario
        try {
            const participants = await Participant.findAll({
                where: { conversation_id: conversationId },
                attributes: ['user_id'],
                raw: true
            });

            // Enviar a todos los participantes excepto al que escribe
            participants.forEach(p => {
                if (p.user_id !== currentUserId) {
                    socket.to(`user_${p.user_id}`).emit('user_stopped_typing', { conversationId });
                }
            });
        } catch (error) {
            console.error('Error al notificar stop typing:', error);
        }
    });

    // Evento para notificar que se envió un nuevo mensaje (para actualizar la UI)
    socket.on('message_sent', async (conversationId: number) => {
        // Enviar a la sala del chat para que actualice la vista
        socket.to(`chat_${conversationId}`).emit('message_sent', { conversationId });
    });
};