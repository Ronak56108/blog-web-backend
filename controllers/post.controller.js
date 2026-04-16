import postService from '../services/post.service.js';

class PostController {
  async createPost(req, res, next) {
    try {
      const postData = { ...req.body, author: req.user._id };
      const post = await postService.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async getPosts(req, res, next) {
    try {
      const { search, category, status, page, limit } = req.query;
      // Default to only fetching published posts unless admin or author
      // Basic implementation - we just fetch published by default for the public feed
      const query = { search, category, status: status || 'published' };
      
      const result = await postService.getPosts(query, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyPosts(req, res, next) {
    try {
      const { page, limit } = req.query;
      // Filter strictly by author and allow all statuses
      const query = { author: req.user._id };
      const result = await postService.getPosts(query, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPostBySlug(req, res, next) {
    try {
      const post = await postService.getPostBySlug(req.params.slug);
      res.status(200).json(post);
    } catch (error) {
      if (error.message === 'Post not found') {
        res.status(404);
      }
      next(error);
    }
  }

  async getPostById(req, res, next) {
    try {
      const post = await postService.getPostById(req.params.id);
      res.status(200).json(post);
    } catch (error) {
      if (error.message === 'Post not found') res.status(404);
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const post = await postService.updatePost(req.params.id, req.user._id, req.user.role, req.body);
      res.status(200).json(post);
    } catch (error) {
      if (error.message === 'Post not found') res.status(404);
      if (error.message === 'Not authorized to update this post') res.status(403);
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      await postService.deletePost(req.params.id, req.user._id, req.user.role);
      res.status(200).json({ message: 'Post removed' });
    } catch (error) {
      if (error.message === 'Post not found') res.status(404);
      if (error.message === 'Not authorized to delete this post') res.status(403);
      next(error);
    }
  }
}

export default new PostController();
