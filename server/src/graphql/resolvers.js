/**
 * GraphQL Resolvers
 *
 * Implement the logic for each field in your schema.
 * Resolvers are functions that return data for each type/field.
 */

import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';
import { postRepository } from '../repositories/post.repository.js';
import { likeRepository } from '../repositories/like.repository.js';
import { signToken } from '../auth/jwt.js';
import {
  findAllPostsWithAuthor,
  findPostsByUserWithAuthor,
  findPostByIdWithAuthor,
  findAllLikesWithUserAndPost,
  findLikesByPostIdWithUserAndPost,
} from '../data/joinQueries.js';

function formatPost(post) {
  if (!post) return null;
  return {
    ...post,
    id: String(post.id),
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
}

export const resolvers = {
  Query: {
    hello: () => 'Hello from Threads GraphQL!',

    getAllUsers: async () => {
      return userRepository.findAll();
    },
    getUser: async (_, { id }) => {
      return userRepository.findById(id);
    },
    getPost: async (_, { id }) => {
      const withAuthor = findPostByIdWithAuthor(id);
      if (withAuthor) return withAuthor;
      const row = postRepository.findById(id);
      return row ? formatPost(row) : null;
    },
    getAllPosts: async (_, { limit = 50, offset = 0 }) => {
      return findAllPostsWithAuthor(limit, offset);
    },
    getPostsByUser: async (_, { userId, limit = 50, offset = 0 }) => {
      return findPostsByUserWithAuthor(userId, limit, offset);
    },
    getAllLikes: async (_, { limit = 50, offset = 0 }) => {
      return findAllLikesWithUserAndPost(limit, offset);
    },
    getLikes: async (_, { post_id, limit = 100, offset = 0 }) => {
      return findLikesByPostIdWithUserAndPost(post_id, limit, offset);
    },
    getPostWithComments: async (_, { id }) => {
      return postRepository.findPostWithCommentsById(id);
    },
    getCommentsByUserAndPost: async (_, { userId, postId }) => {
      return postRepository.findCommentsByUserAndPost(userId, postId);
    },
  },
  Mutation: {
    _placeholder: () => true,

    createUser: async (_, { username, email, password, displayName }) => {
      if (await userRepository.findByUsername(username)) {
        throw new Error('Username already taken');
      }
      if (await userRepository.findByEmail(email)) {
        throw new Error('Email already registered');
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = userRepository.create({
        username,
        email,
        passwordHash,
        displayName: displayName || null,
      });
      return { ...user, id: String(user.id) };
    },
    login: async (_, { email, password }) => {
      const user = await userRepository.findByEmail(email);
      if (!user) throw new Error('Invalid email or password');
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new Error('Invalid email or password');
      const token = signToken(user.id);
      return {
        token,
        user: { ...user, id: String(user.id) },
      };
    },
    createPost: async (_, { content }, context) => {
      const { userId } = context.user || {};
      if (!userId) throw new Error('Authentication required. Send Authorization: Bearer <token>');
      const user = userRepository.findById(userId);
      if (!user) throw new Error('User not found');
      const post = postRepository.create({ userId, content });
      return formatPost(post);
    },
  },
  Post: {
    author: (parent) => {
      if (parent.author) return parent.author;
      const user = userRepository.findById(parent.user_id);
      return user ? { ...user, id: String(user.id) } : null;
    },
  },
  Likes: {
    user: (parent) => {
      if (parent.user) return parent.user;
      const user = userRepository.findById(parent.user_id);
      return user ? { ...user, id: String(user.id) } : null;
    },
    post: (parent) => {
      if (parent.post) return parent.post;
      const post = postRepository.findById(parent.post_id);
      return post ? { ...post, id: String(post.id) } : null;
    },
  }
};
