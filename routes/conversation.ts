import { Router, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { Conversation, Message, Participant, User } from "../database/associations";
import { Op } from "sequelize";
import { checkIfRequestHasBody } from "../utils/validation/request";
import ServerError from "../classes/ServerError";

const router = Router();



router.get('/', async (req: AuthRequest, res) => {
    try {
        const inbox = await Conversation.findAll({
            attributes: ['id', 'type', 'last_message_id', 'updated_at'],
            include: [
                {
                    model: Participant,
                    as: 'self_participation',
                    where: { user_id: req.user!.id },
                    attributes: ['last_read_message_id'],
                    required: true 
                },
                {
                    model: Message,
                    as: 'lastMessage',
                    attributes: ['content']
                },
                {
                    model: Participant,
                    as: 'other_participants',
                    // FILTRO CRÍTICO: Traer a todos los que NO sean el usuario actual
                    where: { 
                        user_id: { [Op.ne]: req.user!.id } 
                    },
                    required: false,
                    attributes: ['user_id'],
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'avatar']
                    }]
                }
            ],
            order: [['updated_at', 'DESC']]
        });


        return res.status(200).json(inbox);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error en el servidor");
    }
});

// Ruta donde se pretende establecer comunicacion con un grupo o una persona
router.post('/', async (req: AuthRequest, res) => {

    // Verificar que haya un cuerpo
    checkIfRequestHasBody(req);

    // Campos esperados
    const {
        receiver_user_id,
        initial_message
    } = req.body;

    // Si falta receiver_user_id
    if (!receiver_user_id || typeof receiver_user_id != 'number') {
        throw new ServerError(400, "No se ha especificado un destino valido")
    }

    // Crear conversacion
    const newConversation = await Conversation.create({
        type: "PRIVATE"
    });

    // Crear un mensaje asociado a la conversacion de origen igual al usuario autentificado
    const newMessage = await Message.create({
        conversation_id: newConversation.id,
        content: initial_message,
        user_id: req.user!.id
    });

    // Crear los participantes en la conversacion (el origen)
    await Participant.create({
        conversation_id: newConversation.id,
        user_id: req.user!.id,
        last_read_message_id: newMessage.id
    });

    // El participante destino
    await Participant.create({
        user_id: receiver_user_id,
        conversation_id: newConversation.id
    });

    // Agregar ultimo mensaje enviado
    newConversation.set({ last_message_id: newMessage.id });
    await newConversation.save();

    // Construccion de la respuesta
    const response = {
        id: newMessage.id,
        conversationId: newConversation.id,
        date: (newMessage as any).created_at
    }

    res.send(response);
});

export default router;