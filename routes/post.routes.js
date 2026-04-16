import express from 'express';
import postController from '../controllers/post.controller.js';
import { protect, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, postController.createPost)
  .get(postController.getPosts);

router.route('/me')
  .get(protect, postController.getMyPosts);

router.route('/:slug')
  .get(postController.getPostBySlug);

router.route('/id/:id')
  .get(protect, postController.getPostById)
  .put(protect, postController.updatePost)
  .delete(protect, postController.deletePost);

export default router;
