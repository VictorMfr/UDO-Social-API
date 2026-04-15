import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargamos variables de entorno (asegúrate de tener instalado dotenv)
dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;

// 1. Instancia de conexión
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'postgres',
  port: dbPort,
  logging: false, // Cambia a console.log si quieres ver el SQL en consola
  dialectModule: require('pg'),
  define: {
    // Estas opciones aplican a todos los modelos globalmente
    underscored: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
});

// 2. Función para verificar la conexión
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente.');

    // Sincronización de modelos (en desarrollo)
    // CUIDADO: .sync({ alter: true }) ajusta las tablas sin borrar datos.
    await sequelize.sync({ alter: false }); 
    console.log('🚀 Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

export default sequelize;