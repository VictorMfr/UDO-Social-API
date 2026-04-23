import { Router } from 'express';
import { col, fn, Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth';
import ServerError from '../classes/ServerError';
import { checkIfRequestHasBody } from '../utils/validation/request';
import { User, Message } from '../database/associations';
import { io } from '..';

const router = Router();

// Enviar mensaje
router.post('/', async (req: AuthRequest, res) => {
  // Verificar que exita un cuerpo
  checkIfRequestHasBody(req);

  // Evitar que los mensajes sean vacios
  if (!req.body.message || !req.body.conversation_id || !req.body.sender_id) {
    throw new ServerError(400, 'Mensaje no valido para enviar');
  }

  // Evitar que se tenga un origen distinto al usuario con sesion iniciada
  if (req.body.sender_id !== req.user?.id) {
    throw new ServerError(403, 'No autorizado');
  }

  const msg = await Message.create({
    conversation_id: req.body.conversation_id,
    message: req.body.message,
    sender_id: req.user!.id
  });

  // 2. Emitir el mensaje por Socket.io a la sala correspondiente
  io.to(`chat_${req.body.conversation_id}`).emit("receive_message", {
    id: msg.id,
    dest: 'other', // Luego en el front validamos si soy yo o no
    content: msg.message,
    date: (msg as any).created_at,
    sender_id: msg.sender_id // Envía esto para saber quién lo mandó
  });

  res.status(201).json(msg);
});







// Listar chat entre dos usuarios (Conversación privada)
router.get('/', async (req: AuthRequest, res) => {

  // Verificar que tenga el query de dest
  if (!req.query.idConv) {
    throw new ServerError(400, 'No se ha especificado destinatario');
  }

  // Evitar querys extraños
  if (typeof req.query.idConv !== 'string') {
    throw new ServerError(400, 'Query no valido')
  }

  // Listar todos los mensajes con la id de conversacion dada
  const messages = await Message.findAll({
    where: { conversation_id: req.query.idConv },
    attributes: [
      'id',
      'message',
      [col('sender.id'), 'sender_id'],
      [col('sender.username'), 'sender_username'],
      'is_read',
      'updated_at'
    ],
    include: [
      { model: User, as: 'sender', attributes: [] },
    ],
    raw: true,
    order: [['created_at', 'ASC']]
  });

  
  res.json(messages);
});














// Marcar como leído
router.put('/read/:id', async (req: AuthRequest, res) => {

  // Asegurarse de que el usuario haya introducido un params valido
  if (!req.params.id || isNaN(parseInt(req.params.id as string))) {
    throw new ServerError(400, 'Parametros no validos');
  }

  // Buscar el mensaje
  const message = await Message.findByPk(req.params.id as string);
  if (!message) {
    throw new ServerError(404, 'Mensaje no encontrado');
  }

  // El unico que puede marcar como leido un mensaje es el receptor
  // Asi que se debe verficar que el usuario con la sesion sea el mismo
  // receptor
  if (req.user!.id !== message.sender_id) {
    throw new ServerError(403, 'No autorizado');
  }

  message.set({
    is_read: true
  });

  await message.save();

  res.json({ success: true });
});

export default router;