// Librerias para express
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
import conversationRoutes from './routes/conversation';

// Funcionalidad de socket.io para conexiones abiertas (Chat en tiempo real)
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { serverSocketsInitialize } from './sockets/sockets';

// Configuración de variables de entorno
dotenv.config();
const PORT = process.env.PORT;


// Incializacion del Express
const app: Application = express();
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});


// Registro de eventos de socket
io.on('connection', serverSocketsInitialize);







// --- Middlewares Globales ---

app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_CLIENT_URL || '*'
})); // Permite peticiones desde el frontend Next.js

app.use(express.json()); // Habilita el parseo de JSON en el body
app.use(cookieParser());












// --- Definición de Rutas ---
app.use('/api/auth', authRoutes, errorHandler);
app.use('/api/users', authenticateToken, userRoutes, errorHandler);
app.use('/api/posts', authenticateToken, postRoutes, errorHandler);
app.use('/api/comments', authenticateToken, commentRoutes, errorHandler);
app.use('/api/messages', authenticateToken, messageRoutes, errorHandler);
app.use('/api/conversations', authenticateToken, conversationRoutes, errorHandler);

// Ruta de salud del sistema (Health Check)
app.get('/', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});















// --- Inicialización del Servidor ---
const startServer = async () => {
  try {
    // 1. Conectar a MySQL
    await connectDB();

    // Ejecucion en local
    if (require.main === module) {
      // 2. Levantar Express con server (anteriormente app)
      server.listen(PORT, () => {
        console.log(`
      🚀 Servidor de la Red Social Universitario listo.
      📡 Puerto: ${PORT}
      🔗 URL: http://localhost:${PORT}/api
      `);
      });
    }
  } catch (error) {
    console.error('💥 Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); // Esto solo se inicializa cuando se esta ejecutando en local

// Antes se exportaba app, pero como se hara la integracion con sockets.io y siguiendo
// la documentacion, asi es como se deberia exportar y configurar
export default server;