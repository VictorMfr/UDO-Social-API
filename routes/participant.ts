import { Router } from "express";
import { AuthRequest } from "../middlewares/auth";
import { Conversation, Message, Participant, User } from "../database/associations";
import { Op } from "sequelize";

const router = Router();

router.get('/', async (req: AuthRequest, res) => {
    const inbox = await Conversation.findAll({
        attributes: [
            'id',
            'type',
            'name',
            'avatar',
            'last_message_id',
            'updated_at'
        ],
        include: [
            {
                model: Participant,
                as: 'participants',
                where: { user_id: req.user!.id },
                attributes: ['last_read_message_id']
            },
            {
                model: Participant,
                as: 'all_participants',
                attributes: ['user_id'],
                where: { user_id: { [Op.ne]: req.user!.id } },
                required: false,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['username', 'avatar']
                }]
            },
            {
                model: Message,
                as: 'lastMessage',
                attributes: ['content']
            }
        ],
        order: [['updated_at', 'DESC']],
        raw: true,
        nest: true
    });

    

    return res.status(200).json(inbox);
});

export default router;