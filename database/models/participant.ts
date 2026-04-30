import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from "sequelize";
import db from "../db";

// Definición del modelo Conversation con tipado estricto e inferencia de atributos
export class Participant extends Model<InferAttributes<Participant>, InferCreationAttributes<Participant>> {
    // Atributos generados automáticamente por la base de datos
    declare id: CreationOptional<number>;

    // Claves foráneas tipadas explícitamente
    declare user_id: ForeignKey<number>;
    declare conversation_id: ForeignKey<number>;
    declare last_read_message_id: CreationOptional<ForeignKey<number>>;
}

Participant.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    last_read_message_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize: db,
    tableName: 'participants',
    underscored: true,
    timestamps: true,
    paranoid: true, // Habilita el borrado lógico (Soft Delete)
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});