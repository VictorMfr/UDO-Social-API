import { Router } from 'express';
import { User } from '../database/associations';
import { AuthRequest } from '../middlewares/auth';
import ServerError from '../classes/ServerError';
import { Op } from 'sequelize';
import { checkIfRequestHasBody } from '../utils/validation/request';
import { upload } from '../config/multer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const router = Router();


// Inicializa tu cliente de Supabase (puedes mover esto a una config global)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! // Usa la service role key para saltar RLS en el server
);

// Listar todos o buscar por username
router.get('/', async (req: AuthRequest, res) => {

  const { q } = req.query; // Capturamos el término de búsqueda ?q=...
  const myId = req.user!.id; // Obtenemos tu ID del middleware de auth

  let whereClause: {
    id: { [Op.ne]: number };
    username?: { [Op.iLike]: string };
  } = {
    // Regla de oro: Nunca mostrar al propio usuario en la lista de búsqueda
    id: { [Op.ne]: myId }
  };

  // Si viene un término de búsqueda, agregamos el filtro de username
  if (q) {
    whereClause.username = {
      [Op.iLike]: `%${q}%` // Busca cualquier coincidencia parcial
    };
  }

  const users = await User.findAll({
    where: whereClause,
    attributes: ['id', 'username', 'avatar'], // Solo envía lo necesario
    limit: q ? 10 : 20, // Limitamos para no saturar si hay muchos usuarios
    order: [['username', 'ASC']]
  });

  res.json(users);

});

// Leer perfil propio
router.get('/me', async (req: AuthRequest, res) => {
  const user = await User.findByPk(req.user!.id);

  if (!user) {
    throw new ServerError(404, 'Usuario no encontrado');
  }

  res.json(user);
});

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

// Actualizar avatar
router.put('/me/avatar', upload.single('image'), async (req: AuthRequest, res, next) => {

  // 1. Validaciones iniciales
  checkIfRequestHasBody(req);

  // Verificar si el archivo subido existe
  if (!req.file) {
    throw new ServerError(400, 'No se ha subido ninguna imagen');
  }

  // Verificar si el usuario existe
  if (!req.user) {
    throw new ServerError(403, 'Usuario no autentificado');
  }

  // Verificar si el usuario existe en la base de datos
  const userToUpdate = await User.findByPk(req.user.id);
  if (!userToUpdate) {
    throw new ServerError(404, 'Usuario no encontrado');
  };








  // Generar nombre de archivo único
  const fileExt = path.extname(req.file.originalname);
  const fileName = `${req.user.id}/avatar_${Date.now()}${fileExt}`;

  // Subir el Buffer a Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('avatars')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    });

  if (storageError) {
    throw new ServerError(500, 'Error al subir la imagen a Supabase');
  }









  // Obtener la URL pública del archivo subido
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  // Lógica de limpieza: Borrar el archivo viejo si existe
  if (userToUpdate.avatar) {
    try {
      const oldAvatarUrl = userToUpdate.avatar;
      const pathParts = oldAvatarUrl.split('/avatars/');

      if (pathParts.length > 1) {
        const oldPath = pathParts[1];

        // Borramos de Supabase (pasamos un array de rutas)
        await supabase.storage
          .from('avatars')
          .remove([oldPath]);

        console.log(`Archivo viejo eliminado: ${oldPath}`);
      }
    } catch (cleanError) {
      console.error('Error al limpiar avatar viejo:', cleanError);
    }
  }








  await userToUpdate.update({ avatar: publicUrl });

  return res.status(200).json({
    message: 'Avatar actualizado correctamente',
    avatarUrl: userToUpdate.avatar
  });
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