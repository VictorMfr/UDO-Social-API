import { 
  DataTypes, 
  Model, 
  InferAttributes, 
  InferCreationAttributes, 
  CreationOptional,
  ForeignKey 
} from "sequelize";
import db from "../db";

// Definición del modelo Comment con tipado avanzado
export class Comment extends Model<InferAttributes<Comment>, InferCreationAttributes<Comment>> {
  // Atributo autogenerado
  declare id: CreationOptional<number>;
  
  // Claves foráneas tipadas para mantener la integridad en el código
  declare user_id: ForeignKey<number>;
  declare post_id: ForeignKey<number>;
  
  declare content: string;
}

Comment.init({
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  post_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  content: { 
    type: DataTypes.STRING(500), 
    allowNull: false 
  }
}, { 
  sequelize: db, 
  tableName: 'comments',
  underscored: true,
  timestamps: true,
  paranoid: true, // Soft delete habilitado
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

export default Comment;