import { Response } from 'express';

export default function handleServerError(res: Response, error: unknown) {
  return res.status(500).json({ message: 'Error interno del servidor' });
}