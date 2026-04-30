import { Comment } from "./models/comment";
import { Post } from "./models/post";
import { User } from "./models/user";
import { Message } from "./models/message";
import { Conversation } from "./models/conversation";
import { Participant } from "./models/participant";

console.log("Estableciendo asociaciones profesionales para UDO Social...");

// --- Relación User - Post ---
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// --- LA NUEVA ARQUITECTURA DE CHAT (Muchos a Muchos) ---

// Un Usuario puede estar en muchas conversaciones a través de Participantes
User.hasMany(Participant, { foreignKey: 'user_id', as: 'memberships' });
Participant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Una Conversación tiene muchos participantes
Conversation.hasOne(Participant, { foreignKey: 'conversation_id', as: 'self_participation' });
Conversation.hasMany(Participant, { foreignKey: 'conversation_id', as: 'other_participants' });
Participant.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });


// --- MENSAJES Y CONVERSACIÓN ---

// El mensaje pertenece a la conversación y lo envía un usuario
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'user_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'sender' });

// --- DENORMALIZACIÓN Y PUNTEROS (Relaciones 1:1 de apoyo) ---

// Para el Inbox: La conversación tiene un "Último Mensaje"
Conversation.belongsTo(Message, { foreignKey: 'last_message_id', as: 'lastMessage' });

// Para el Visto: El participante apunta al último mensaje leído
Participant.belongsTo(Message, { foreignKey: 'last_read_message_id', as: 'lastReadMessage' });

// --- RED SOCIAL (Posts y Comentarios) ---
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'userComments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

export {
    Comment,
    Post,
    User,
    Message,
    Conversation,
    Participant
};