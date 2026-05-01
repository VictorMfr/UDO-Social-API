import { Router } from "express";
import { AuthRequest } from "../middlewares/auth";
import { Conversation, Participant } from "../database/associations";
import { checkIfRequestHasBody } from "../utils/validation/request";
import ServerError from "../classes/ServerError";

const router = Router();

// Ruta para marcar como leido un mensaje
router.post('/', async (req: AuthRequest, res) => {
    
    // Comprobar si la peticion tiene cuerpo
    checkIfRequestHasBody(req);

    // Se espera que se tenga una id de conversacion 
    const { conv_id } = req.body;

    if (!conv_id || isNaN(parseInt(conv_id))) {
        throw new ServerError(404, 'No se ha proveido de una id valida de conversacion');
    }

    // Obtener el ultimo id de mensaje de la conversacion
    const conversation = await Conversation.findByPk(conv_id);

    if (!conversation) {
        throw new ServerError(404, "Conversacion no encontrada");
    }

    const lastMessageId = conversation.last_message_id;

    // Usar esta id para actualizar en el participante
    await Participant.update({
        last_read_message_id: lastMessageId
    }, {
        where: { user_id: req.user!.id }
    });

    res.send();
});

export default router;