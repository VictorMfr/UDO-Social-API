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
  declare sender_id: ForeignKey<number>;
  
  declare message: string;
  
  // El tipo BOOLEAN es el estándar correcto para PostgreSQL en Supabase
  declare is_read: CreationOptional<boolean>;
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
  sender_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
  message: { 
    type: DataTypes.STRING(500), 
    allowNull: false 
  },
  is_read: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
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