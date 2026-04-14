import { Comment } from "./models/comment";
import { Post } from "./models/post";
import { User } from "./models/user";
import { Message } from "./models/message";

console.log("Estableciendo asociaciones entre modelos...");

// --- Relación User - Post ---
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// --- Relación User - Message (Doble relación) ---

// Emisor
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Receptor
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

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
    Message
}