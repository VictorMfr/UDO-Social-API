import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { Request } from 'express';
import ServerError from '../classes/ServerError';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  

  if (!req.cookies) {
    throw new ServerError(400, 'No se encontraron cookies en la petición.');
  }

  if (!req.cookies.auth_token) {
    throw new ServerError(401, 'Acceso denegado. No hay sesión activa.');
  }

  // 1. Obtener el token de la cookie
  const token = req.cookies.auth_token;

  try {
    // 2. Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };

    // 3. Inyectar los datos del usuario en la petición
    req.user = decoded;

    // 4. Continuar al siguiente paso (el controlador)
    next();
  } catch (error) {
    throw new ServerError(403, 'Token inválido o expirado.');
  }
};