import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import { BaseAttributes } from "./base";
import db from "../db";
import type {
  CreationOptional
} from "sequelize";

// Definición del modelo User
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> implements BaseAttributes {
  declare id: CreationOptional<number>;
  declare username: string;
  declare email: string;
  declare password_hash: string;
  declare bio: CreationOptional<string>;
}

// Inicialización en Sequelize
User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  bio: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  sequelize: db,
  tableName: 'users',
  underscored: true, // Esto convierte automáticamente camelCase a snake_case
  timestamps: true,
  paranoid: true,   // Habilita deleted_at (Soft Delete)
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});