import { 
  DataTypes, 
  Model, 
  InferAttributes, 
  InferCreationAttributes, 
  CreationOptional,
  ForeignKey 
} from "sequelize";
import db from "../db";

export class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  // 'CreationOptional' indica que el campo puede no estar presente al momento de crear (create())
  // porque la base de datos lo genera automáticamente.
  declare id: CreationOptional<number>;
  
  // Usamos ForeignKey para indicar que este campo es una relación. 
  // Ayuda a TypeScript a rastrear el origen del dato.
  declare user_id: ForeignKey<number>;
  
  declare content: string;
  
  // El signo '?' o permitir 'null' es para campos opcionales en la tabla.
  declare media_url: CreationOptional<string | null>;
}

Post.init({
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true,
  },
  user_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  content: { 
    type: DataTypes.STRING(500), 
    allowNull: false 
  },
  media_url: { 
    type: DataTypes.STRING(255),
    allowNull: true, // Coherente con el tipado opcional
    validate: {
      len: {
        args: [0, 255],
        msg: "Media URL must be at most 255 characters long"
      }
    }
  }
}, { 
  sequelize: db, 
  tableName: 'posts',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

export default Post;