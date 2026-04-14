import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importamos la conexión y modelos
import { connectDB } from './database/db';

// Importar el middleware de autenticación
import { authenticateToken } from './middlewares/auth';

// Importamos las rutas
import userRoutes from './routes/user';
import postRoutes from './routes/post';
import commentRoutes from './routes/comment';
import messageRoutes from './routes/message';
import authRoutes from './routes/auth';
import errorHandler from './middlewares/error';
import cookieParser from 'cookie-parser';
import multer from 'multer';

// Configuración de variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares Globales ---
app.use(cors({ credentials: true, origin: '*' })); // Permite peticiones desde tu frontend Next.js
app.use(express.json()); // Habilita el parseo de JSON en el body
app.use(cookieParser());

// --- Definición de Rutas ---
app.use('/api/auth', authRoutes, errorHandler);
app.use('/api/users', authenticateToken, userRoutes, errorHandler);
app.use('/api/posts', authenticateToken, postRoutes, errorHandler);
app.use('/api/comments', authenticateToken, commentRoutes, errorHandler);
app.use('/api/messages', authenticateToken, messageRoutes, errorHandler);

// Ruta de salud del sistema (Health Check)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// --- Inicialización del Servidor ---
const startServer = async () => {
  try {
    // 1. Conectar a MySQL
    await connectDB();

    // 2. Levantar Express
    app.listen(PORT, () => {
      console.log(`
      🚀 Servidor de la Red Social Universitario listo.
      📡 Puerto: ${PORT}
      🔗 URL: http://localhost:${PORT}/api
      `);
    });
  } catch (error) {
    console.error('💥 Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();