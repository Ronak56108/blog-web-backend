import Post from '../models/post.model.js';

class PostRepository {
  async createPost(postData) {
    const post = new Post(postData);
    return await post.save();
  }

  async getPosts(query, skip, limit) {
    return await Post.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countPosts(query) {
    return await Post.countDocuments(query);
  }

  async getPostBySlug(slug) {
    return await Post.findOne({ slug }).populate('author', 'name avatar');
  }

  async getPostById(id) {
    return await Post.findById(id);
  }

  async updatePost(id, updateData) {
    return await Post.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deletePost(id) {
    return await Post.findByIdAndDelete(id);
  }
}

export default new PostRepository();
