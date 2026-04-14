import { Router } from 'express';
import { Message } from '../database/models/message';
import { Op } from 'sequelize';
import { AuthRequest } from '../middlewares/auth';
import ServerError from '../classes/ServerError';
import { checkIfRequestHasBody } from '../utils/validation/request';

const router = Router();

// Enviar mensaje
router.post('/', async (req: AuthRequest, res) => {
  // Verificar que exita un cuerpo
  checkIfRequestHasBody(req);

  // Evitar que los mensajes sean vacios
  if (!req.body.message || !req.body.receiver_id || !req.body.sender_id) {
    throw new ServerError(400, 'Mensaje no valido para enviar');
  }

  // Evitar que se tenga un origen distinto al usuario con sesion iniciada
  if (req.body.sender_id !== req.user?.id) {
    throw new ServerError(403, 'No autorizado');
  }

  const msg = await Message.create({
    message: req.body.message,
    receiver_id: req.body.receiver_id,
    sender_id: req.user!.id
  });

  res.status(201).json(msg);
});

// Listar chat entre dos usuarios (Conversación privada)
router.get('/', async (req: AuthRequest, res) => {

  // Verificar que tenga el query de dest
  if (!req.query.dest) {
    throw new ServerError(400, 'No se ha especificado destinatario');
  }

  // Evitar querys extraños
  if (typeof req.query.dest !== 'string') {
    throw new ServerError(400, 'Query no valido')
  }

  // Asegurarse de que el usuario receptor exista
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { sender_id: req.user!.id, receiver_id: req.query!.dest },
        { sender_id: req.query.dest, receiver_id: req.user!.id }
      ]
    },
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
  if (req.user!.id !== message.receiver_id) {
    throw new ServerError(403, 'No autorizado');
  }

  message.set({
    is_read: true
  });

  await message.save();

  res.json({ success: true });
});

export default router;