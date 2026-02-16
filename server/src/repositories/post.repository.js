/**
 * Post Repository
 *
 * Data access layer for Post entity.
 */

import { getDb } from '../db/index.js';
import { userRepository } from './user.repository.js';

export const postRepository = {
  async findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) ?? null;
  },

  async findByIds(ids) {
    const db = getDb();
    return (await db.prepare('SELECT * FROM posts WHERE id IN (?)').all(ids)) ?? [];
  },

  async findByUserId(userId, limit = 50, offset = 0) {
    const db = getDb();
    return db
      .prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(userId, limit, offset);
  },

  async findAll(limit = 50, offset = 0) {
    const db = getDb();
    return db
      .prepare('SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(limit, offset);
  },

  async create({ userId, content }) {
    const db = getDb();
    const result = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)').run(userId, content);
    return postRepository.findById(result.lastInsertRowid);
  },

  async update(id, { content }) {
    const db = getDb();
    const post = postRepository.findById(id);
    if (!post) return null;

    db.prepare('UPDATE posts SET content = ?, updated_at = datetime("now") WHERE id = ?').run(content, id);
    return postRepository.findById(id);
  },

  async delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  },

  async getLikeCount(postId) {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);
    return row?.count ?? 0;
  },

  async getCommentCount(postId) {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(postId);
    return row?.count ?? 0;
  },

  async findPostWithCommentsById(id) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!row) return null;
    const comments = db.prepare('SELECT * FROM comments WHERE post_id = ?').all(id);
    return comments.map(comment => ({
      ...comment,
      author: userRepository.findById(comment.user_id),
    }));
  },

  async findCommentsByUserAndPost(userId, postId) {
    const db = getDb();
    const comments = db.prepare('SELECT * FROM comments WHERE user_id = ? AND post_id = ?').all(userId, postId);
    return comments.map(comment => ({
      ...comment,
      author: userRepository.findById(comment.user_id),
    }));
  },
};
