import { Router } from 'express';
import { checkIfRequestHasBody } from '../utils/validation/request';
import ServerError from '../classes/ServerError';
import { AuthRequest } from '../middlewares/auth';
import { Post, User, Comment } from '../database/associations';
import { col } from 'sequelize';

const router = Router();

// Crear comentario
router.post('/', async (req: AuthRequest, res) => {

  // Primero que haya un cuerpo
  checkIfRequestHasBody(req);

  // Comprobar que haya un contenido
  if (!req.body.content) {
    throw new ServerError(400, 'Comentario no valido');
  }

  // Comprobar que hay un destinatario de post
  if (!req.body.post_id) {
    throw new ServerError(400, 'Comentario no tiene destinatario')
  }

  // Comprobar que tal post realmente existe
  const post = await Post.findByPk(req.body.post_id);
  if (!post) {
    throw new ServerError(404, 'El post a comentar no existe');
  }

  const comment = await Comment.create({
    content: req.body.content!,
    post_id: req.body.post_id!,
    user_id: req.user!.id
  });

  res.status(201).json(comment);
});

// Listar comentarios de un post específico
router.get('/', async (req, res) => {

  // Verificar que existe el query de post
  if (!req.query.post) {
    throw new ServerError(400, 'No se ha especificado el post a comentar');
  }

  // Verificar que el post existe
  const post = await Post.findByPk(req.query.post as string);
  if (!post) {
    throw new ServerError(404, 'El post a comentar no existe');
  }

  const comments = await Comment.findAll({
    attributes: [
      'id',
      [col('username'), 'username'],
      'content',
      'created_at',
      'deleted_at', // La fecha en cuestion
      'updated_at'
    ],
    include: [{
      model: User,
      as: 'author',
      attributes: []
    }],
    where: {
      post_id: parseFloat(req.query.post as string)
    },
    raw: true
  });

  res.json(comments);
});



// Actualizar un comentario
router.patch('/:id', async (req: AuthRequest, res) => {
  // Verificar que el params existe
  if (!req.params.id || isNaN(parseInt(req.params.id as string))) {
    throw new ServerError(400, 'Identificador de comentario no valido')
  }

  // Verificar que el comentario exista
  const comment = await Comment.findByPk(req.params.id as string);
  if (!comment) {
    throw new ServerError(404, 'El comentario no existe');
  }

  // Verificar que el usuario sea el autor
  if (req.user!.id !== comment.user_id) {
    throw new ServerError(403, 'No tienes permiso para hacer esta accion');
  }

  // Verificar que tenga un cuerpo
  checkIfRequestHasBody(req);

  // Verificar que haya un contenido
  if (!req.body.content) {
    throw new ServerError(400, 'Comentario vacio no valido');
  }

  comment.set({
    content: req.body.content ?? comment.content
  });

  await comment.save();

  res.json({ message: 'Comentario actualizado' });
});






// Eliminar un comentario por ID
router.delete('/:id', async (req: AuthRequest, res) => {

  // Verificar que el params existe
  if (!req.params.id || isNaN(parseInt(req.params.id as string))) {
    throw new ServerError(400, 'Identificador de comentario no valido')
  }

  // Verificar que el comentario exista
  const comment = await Comment.findByPk(req.params.id as string);
  if (!comment) {
    throw new ServerError(404, 'El comentario no existe');
  }

  // Verificar que el usuario sea el autor
  if (req.user!.id !== comment.user_id) {
    throw new ServerError(403, 'No tienes permiso para hacer esta accion');
  }

  await comment.destroy();

  res.json({ message: 'Comentario eliminado' });
});

export default router;