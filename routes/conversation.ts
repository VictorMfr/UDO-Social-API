import { Router, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { Conversation, Message, User } from "../database/associations";
import { col, literal, Op } from "sequelize";
import { checkIfRequestHasBody } from "../utils/validation/request";
import ServerError from "../classes/ServerError";
import { io } from "..";

const router = Router();

// Crear una conversación entre dos usuarios
router.post("/", async (req: AuthRequest, res: Response) => {

    // Verificar si existe el body
    checkIfRequestHasBody(req);

    // Verificar si existe un destinatario
    if (!req.body.receiver_id) {
        throw new ServerError(400, "No se ha especificado el destinatario de la conversación");
    }

    // Verificar que el mensaje tenga un contenido
    if (!req.body.message) {
        throw new ServerError(400, "No se ha especificado un mensaje para iniciar la conversación");
    }

    // Evitar que se inicie un chat con uno mismo
    if (req.user!.id === req.body.receiver_id) {
        return res.status(400).json({ message: "No puedes iniciar un chat contigo mismo" });
    }

    // Buscar si ya existe una conversacion entre estos dos usuarios (en cualquier orden)
    const conversation = await Conversation.findOne({
        where: {
            [Op.or]: [
                { user_one: req.user!.id, user_two: req.body.receiver_id },
                { user_one: req.body.receiver_id, user_two: req.user!.id }
            ]
        }
    });

    if (conversation) {
        throw new ServerError(400, "Ya existe una conversación entre estos usuarios");
    }

    // Buscar si el destinatario existe
    const receiver = await User.findByPk(req.body.receiver_id);
    if (!receiver) {
        throw new ServerError(404, "El destinatario de la conversación no existe");
    }

    // Crear la conversacion
    const createdConversation = await Conversation.create({
        user_one: req.user!.id,
        user_two: req.body.receiver_id
    });

    // Lo logico es que se envie un mensaje inicial 
    // inmediatamente despues de que se crea la conversacion
    const message = await Message.create({
        conversation_id: createdConversation.id,
        sender_id: req.user!.id,
        message: req.body.message
    });

    // Emitir el mensaje por Socket.io a la sala correspondiente
    io.to(`chat_${createdConversation.id}`).emit("receive_message", {
        id: message.id,
        dest: 'other', // Luego en el front validamos si soy yo o no
        content: message.message,
        date: (message as any).created_at,
        sender_id: message.sender_id // Envía esto para saber quién lo mandó
    });

    res.status(201).json(message);
});










// Obtener conversaciones
router.get("/", async (req: AuthRequest, res: Response) => {
    const myId = req.user!.id;

    // Obtener las conversaciones del usuario, ordenadas por fecha de actualización (último mensaje)
    const conversations = await Conversation.findAll({
        attributes: [
            'id',
            [col('starter.username'), 'starter_username'],
            [col('receiver.username'), 'receiver_username'],
            [literal(`(SELECT message FROM messages WHERE messages.conversation_id = "${Conversation.name}".id ORDER BY created_at DESC LIMIT 1)`), 'last_message'],
            [literal(`(SELECT sender_id FROM messages WHERE messages.conversation_id = "Conversation".id ORDER BY created_at DESC LIMIT 1)`),'last_message_sender_id']
        ],
        where: {
            [Op.or]: [
                { user_one: myId },
                { user_two: myId }
            ]
        },
        include: [
            { model: User, as: 'starter', attributes: [] },
            { model: User, as: 'receiver', attributes: [] }
        ],
        order: [['updated_at', 'DESC']],
        raw: true
    });

    res.json(conversations);

});

export default router;