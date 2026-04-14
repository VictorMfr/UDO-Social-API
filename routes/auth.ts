import { Router, Request, Response } from 'express';
import { User } from '../database/associations';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkIfRequestHasBody } from '../utils/validation/request';
import { checkCreateUserFields, checkLoginUserFields } from '../utils/validation/auth';
import { ICreateUserRequestBody } from '../types/routes/auth';
import ServerError from '../classes/ServerError';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback';














// REGISTRO: Guardar usuario con contraseña encriptada
router.post('/register', async (req: Request, res: Response) => {

  // Validaciones
  checkIfRequestHasBody(req);
  checkCreateUserFields(req.body);

  const { username, email, password } = req.body as ICreateUserRequestBody;

  // 1. Encriptar contraseña (10 rondas de salt es el estándar)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 2. Crear usuario en Supabase
  await User.create({
    username,
    email,
    password_hash: hashedPassword
  });

  return res.status(201).json({ message: 'Usuario creado' });
});

















// LOGIN: Verificar y generar JWT
router.post('/login', async (req: Request, res: Response) => {

  // Validaciones
  checkIfRequestHasBody(req);
  checkLoginUserFields(req.body);

  const { email, password } = req.body;

  // 1. Buscar usuario
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ServerError(401, 'Credenciales inválidas');
  }

  // 2. Comparar contraseñas usando bcryptjs
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ServerError(401, 'Credenciales inválidas');
  }

  // 3. Crear el Token (Payload: id del usuario)
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' } // El token expira en 1 día
  );

  // 4. Enviar el token en una cookie HttpOnly
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: 'lax'
  });

  return res.json({ 
    message: 'Login exitoso', 
    username: user.username,
  });
});


















// LOGOUT: Limpiar cookie
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  return res.json({ message: 'Sesión cerrada' });
});

export default router;