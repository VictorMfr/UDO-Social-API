import { Socket, Server } from "socket.io";
import { Participant } from "../../database/associations";
import { Op } from "sequelize";
import { io } from "../..";

export const userHandler = (socket: Socket, onlineUsers: Map<number, string>) => {
    socket.on('user_online', async ({ userId }: { userId: number }) => {
        socket.join(`user_${userId}`);
        onlineUsers.set(userId, socket.id);

        try {
            // Buscamos contactos compartiendo conversaciones
            const myConvs = await Participant.findAll({ 
                where: { user_id: userId }, 
                attributes: ['conversation_id'],
                raw: true 
            });
            const convIds = myConvs.map(c => c.conversation_id);

            const contacts = await Participant.findAll({
                where: { conversation_id: convIds, user_id: { [Op.ne]: userId } },
                attributes: ['user_id'],
                raw: true
            });

            const uniqueContactIds = [...new Set(contacts.map(c => c.user_id))];

            // 1. Notificar a los contactos que el usuario se conectó
            uniqueContactIds.forEach(contactId => {
                if (onlineUsers.has(contactId)) {
                    io.to(`user_${contactId}`).emit('contact_online', { userId, status: 'online' });
                }
            });

            // 2. Informar al usuario cuáles de sus contactos ya están en línea
            const onlineContacts = uniqueContactIds.filter(contactId => onlineUsers.has(contactId));
            socket.emit('contacts_online', { contacts: onlineContacts });
        } catch (error) {
            console.error('Error al notificar contactos:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
        let disconnectedUserId: number | null = null;
        
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }

        // Notificar a los contactos que el usuario se desconectó
        if (disconnectedUserId !== null) {
            (async () => {
                try {
                    const myConvs = await Participant.findAll({ 
                        where: { user_id: disconnectedUserId }, 
                        attributes: ['conversation_id'],
                        raw: true 
                    });
                    const convIds = myConvs.map(c => c.conversation_id);

                    const contacts = await Participant.findAll({
                        where: { conversation_id: convIds, user_id: { [Op.ne]: disconnectedUserId } },
                        attributes: ['user_id'],
                        raw: true
                    });

                    const uniqueContactIds = [...new Set(contacts.map(c => c.user_id))];

                    uniqueContactIds.forEach(contactId => {
                        if (onlineUsers.has(contactId)) {
                            io.to(`user_${contactId}`).emit('contact_offline', { userId: disconnectedUserId });
                        }
                    });
                } catch (error) {
                    console.error('Error al notificar desconexión:', error);
                }
            })();
        }
    });
};