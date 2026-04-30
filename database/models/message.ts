import { 
  DataTypes, 
  Model, 
  InferAttributes, 
  InferCreationAttributes, 
  CreationOptional,
  ForeignKey 
} from "sequelize";
import db from "../db";

// Definición del modelo Message con tipado estricto e inferencia de atributos
export class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  // Atributos generados automáticamente por la base de datos
  declare id: CreationOptional<number>;
  
  // Claves foráneas tipadas explícitamente
  declare conversation_id: ForeignKey<number>;
  declare user_id: ForeignKey<number>;
  declare content: string;
}

Message.init({
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: { 
    type: DataTypes.STRING(500), 
    allowNull: false 
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  }
}, { 
  sequelize: db, 
  tableName: 'messages',
  underscored: true,
  timestamps: true,
  paranoid: true, // Habilita el borrado lógico (Soft Delete)
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

export default Message;