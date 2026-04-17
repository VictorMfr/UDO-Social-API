import { Router } from 'express';
import { User } from '../database/models/user';
import { AuthRequest } from '../middlewares/auth';
import ServerError from '../classes/ServerError';

const router = Router();

// Listar todos
router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Leer perfil propio
router.get('/me', async (req: AuthRequest, res) => {
  const user = await User.findByPk(req.user!.id);

  if (!user) {
    throw new ServerError(404, 'Usuario no encontrado');
  }

  res.json(user);
})

// Leer un usuario en particular
router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  user ? res.json(user) : res.status(404).json({ error: 'No encontrado' });
});

// Actualizar
router.put('/me', async (req: AuthRequest, res) => {
  const user = await User.findByPk(req.user!.id);
  if (user) {
    await user.update(req.body);
    res.json(user);
  } else {
    res.status(404).json({ error: 'No encontrado' });
  }
});

// Destruir (Lógico por defecto gracias a paranoid: true)
router.delete('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.destroy();
    res.json({ message: 'Usuario eliminado lógicamente' });
  } else {
    res.status(404).json({ error: 'No encontrado' });
  }
});

export default router;