import postRepository from '../repositories/post.repository.js';

class PostService {
  async createPost(postData) {
    // Generate slug from title
    const baseSlug = postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueId = Math.random().toString(36).substring(2, 8);
    postData.slug = `${baseSlug}-${uniqueId}`;

    return await postRepository.createPost(postData);
  }

  async getPosts(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    // Handle Text Search Query
    let dbQuery = {};
    if (query.search) {
      dbQuery.$text = { $search: query.search };
    }
    if (query.category) {
      dbQuery.category = query.category;
    }
    if (query.status) {
      dbQuery.status = query.status;
    }
    if (query.author) {
      dbQuery.author = query.author;
    }

    const posts = await postRepository.getPosts(dbQuery, skip, limit);
    const total = await postRepository.countPosts(dbQuery);

    return {
      posts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  async getPostBySlug(slug) {
    const post = await postRepository.getPostBySlug(slug);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  async getPostById(id) {
    const post = await postRepository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  }

  async updatePost(id, userId, userRole, updateData) {
    const post = await postRepository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    // Only Admin or the Author can update
    if (post.author.toString() !== userId.toString() && userRole !== 'admin') {
      throw new Error('Not authorized to update this post');
    }

    if (updateData.title) {
        const baseSlug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const uniqueId = Math.random().toString(36).substring(2, 8);
        updateData.slug = `${baseSlug}-${uniqueId}`;
    }

    return await postRepository.updatePost(id, updateData);
  }

  async deletePost(id, userId, userRole) {
    const post = await postRepository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }

    // Only Admin or the Author can delete
    if (post.author.toString() !== userId.toString() && userRole !== 'admin') {
      throw new Error('Not authorized to delete this post');
    }

    return await postRepository.deletePost(id);
  }
}

export default new PostService();
