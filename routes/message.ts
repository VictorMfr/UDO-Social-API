import { Router } from 'express';
import { col, fn, Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth';
import ServerError from '../classes/ServerError';
import { checkIfRequestHasBody } from '../utils/validation/request';
import { User, Message, Conversation, Participant } from '../database/associations';
import { io } from '..';

const router = Router();

router.post('/', async (req: AuthRequest, res) => {
    // Primero comprobar que la peticion tenga cuerpo
    checkIfRequestHasBody(req);
    
    // Campos esperados
    const { content, conversation_id } = req.body;

    const message = await Message.create({
        content,
        conversation_id,
        user_id: req.user!.id
    });

    // Error 3: Actualizar el last_message_id de la conversación
    const conversation = await Conversation.findByPk(conversation_id);
    if (conversation) {
        conversation.last_message_id = message.id;
        await conversation.save();
    }

    // Error 2: Notificar a los participantes via socket
    const participants = await Participant.findAll({
        where: { conversation_id },
        attributes: ['user_id'],
        raw: true
    });

    participants.forEach(p => {
        if (p.user_id !== req.user!.id) {
            io.to(`user_${p.user_id}`).emit('new_message', {
                conversationId: conversation_id,
                message: {
                    id: message.id,
                    content: message.content,
                    date: (message as any).created_at,
                    origin: 'other',
                    sender: {
                        id: req.user!.id,
                        username: req.user!.username,
                        avatar: (req.user as any).avatar
                    }
                }
            });
        }
    });

    const response = {
        id: message.id,
        date: (message as any).created_at
    }

    res.send(response);
});

router.get('/', async (req: AuthRequest, res, next) => {
    try {
        // Obtener el ID de la conversación desde el query
        const { idConv } = req.query;

        if (!idConv || isNaN(parseInt(idConv as string))) {
            throw new ServerError(400, 'Se requiere el parámetro idConv');
        }

        // Obtener los mensajes de la conversación
        const messages = await Message.findAll({
            where: { conversation_id: parseInt(idConv as string) },
            order: [['created_at', 'ASC']],
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'avatar']
            }]
        });

        // Transformar los mensajes para incluir el origin
        const messagesWithOrigin = messages.map(msg => ({
            id: (msg as any).id,
            content: msg.content,
            date: (msg as any).created_at,
            origin: (msg as any).sender?.id === req.user?.id ? 'self' : 'other',
            sender: (msg as any).sender
        }));

        res.send(messagesWithOrigin);
    } catch (error) {
        next(error);
    }
});

export default router;