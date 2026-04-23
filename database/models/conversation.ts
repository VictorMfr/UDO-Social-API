import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    INTEGER
} from "sequelize";
import db from "../db";

// Definición del modelo Conversation con tipado estricto e inferencia de atributos
export class Conversation extends Model<InferAttributes<Conversation>, InferCreationAttributes<Conversation>> {
    // Atributos generados automáticamente por la base de datos
    declare id: CreationOptional<number>;

    // Claves foráneas tipadas explícitamente
    declare user_one: ForeignKey<number>;
    declare user_two: ForeignKey<number>;
}

Conversation.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_one: {
        allowNull: false,
        type: DataTypes.INTEGER
    },
    user_two: {
        allowNull: false,
        type: DataTypes.INTEGER
    }
}, {
    sequelize: db,
    tableName: 'conversations',
    underscored: true,
    timestamps: true,
    paranoid: true, // Habilita el borrado lógico (Soft Delete)
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
});