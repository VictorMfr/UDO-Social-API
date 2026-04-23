import { Comment } from "./models/comment";
import { Post } from "./models/post";
import { User } from "./models/user";
import { Message } from "./models/message";
import { Conversation } from "./models/conversation";

console.log("Estableciendo asociaciones entre modelos...");

// --- Relación User - Post ---
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });






// --- Relación User - Message (Doble relación) ---

// // Emisor
// User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
// Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// // Receptor
// User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
// Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });


// --- LADO DEL USUARIO (Listas de chats) ---
User.hasMany(Conversation, { foreignKey: 'user_one', as: 'started_chats' });
User.hasMany(Conversation, { foreignKey: 'user_two', as: 'received_chats' });

// --- LADO DE LA CONVERSACIÓN (Personas específicas) ---
Conversation.belongsTo(User, { foreignKey: 'user_one', as: 'starter' });
Conversation.belongsTo(User, { foreignKey: 'user_two', as: 'receiver' });

// --- LADO DE CONVERSACION Y MENSAJES ---
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });



// --- Relación Post - Comment ---
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// --- Relación User - Comment ---
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

export {
    Comment,
    Post,
    User,
    Message,
    Conversation
}