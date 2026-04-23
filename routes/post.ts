import { Router, Response } from 'express';
import { checkIfRequestHasBody } from '../utils/validation/request';
import { checkCreatePostFields } from '../utils/validation/post';
import { AuthRequest } from '../middlewares/auth';
import ServerError from '../classes/ServerError';
import { upload } from '../config/multer';
import { createClient } from "@supabase/supabase-js";
import { User, Post } from '../database/associations';
import { col } from 'sequelize';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);


// Crear post
router.post('/', upload.single('image'), async (req: AuthRequest, res: Response) => {

  // Verificar si la peticion tiene cuerpo
  checkIfRequestHasBody(req);

  // Verificar si hay un campo content
  checkCreatePostFields(req.body);

  // Verificar si viene un archivo en la peticion
  let imageUrl = null;

  if (req.file) {

    // Renombrar el archivo
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`; // Nombre único
    const filePath = `${fileName}`;

    // Subir a Supabase Storage
    const { error } = await supabase.storage
      .from('posts')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    // Administrar en caso de error
    if (error) throw error;

    // Obtener la URL pública
    const { data: publicData } = supabase.storage.from('posts').getPublicUrl(filePath);
    imageUrl = publicData.publicUrl;
  }

  // Crear el post en Sequelize
  const newPost = await Post.create({
    content: req.body.content,
    media_url: imageUrl,
    user_id: req.user!.id
  });

  res.status(201).json(newPost);
});














/* 
  OBTENER TODOS LOS POSTS
  - Nombre del autor
  - Fecha de post
  - Contenido
  - Posible imagen
*/
router.get('/', async (req, res) => {

  
  const posts = await Post.findAll({
    attributes: [
      [col('username'), 'username'],
      'id',
      'created_at',
      'content',
      'media_url'
    ],
    include: [{
      model: User,
      as: 'author',
      attributes: []
    }],
    order: [['created_at', 'DESC']],
    raw: true
  });

  res.json(posts);
});













// Obtener un post por ID
router.get('/:id', async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  post ? res.json(post) : res.status(404).json({ error: 'Post no encontrado' });
});






// Actualizar un post porID, es un patch porque no es necesario enviar todos los campos, 
// solo los que se quieran actualizar
router.patch('/:id', async (req: AuthRequest, res: Response) => {

  // Evita que el usuario haya introducido un ID no numerico
  if (typeof req.params.id !== 'string' || isNaN(parseInt(req.params.id))) {
    throw new ServerError(400, 'Url no valida');
  }

  // Asegurarnos de que el post exista
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    throw new ServerError(404, 'Post no encontrado');
  }

  // Debemos validar que quien hace la peticion es el dueño del post
  if (post.user_id !== req.user!.id) {
    throw new ServerError(403, 'No tienes permiso para editar este post');
  }

  // Debemos validar que el cuerpo de la petición no esté vacío
  checkIfRequestHasBody(req);

  const {
    media_url,
    content
  } = req.body;

  post.set({
    content: content ?? post.content,
    media_url: media_url ?? post.media_url
  })

  await post.save(); // Guardamos los cambios en la base de datos

  res.json(post);
});



// Eliminar un post por ID
router.delete('/:id', async (req: AuthRequest, res: Response) => {

  // Evita que el usuario haya introducido un ID no numerico
  if (typeof req.params.id !== 'string' || isNaN(parseInt(req.params.id))) {
    throw new ServerError(400, 'Url no valida');
  }

  // Evitar que el post no exista
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    throw new ServerError(404, 'El post no existe');
  }

  // Evita que el post sea manipulado por otro que no sea el autor
  if (post.user_id !== req.user!.id) {
    throw new ServerError(400, 'No eres el dueño del post')
  }

  await post.destroy({});

  res.json({ message: 'Post borrado' });
});

export default router;