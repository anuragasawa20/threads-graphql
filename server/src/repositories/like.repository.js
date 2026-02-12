/**
 * Like Repository
 *
 * Data access layer for Like entity (likes on posts).
 */

import { getDb } from '../db/index.js';

export const likeRepository = {
  async findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM likes WHERE id = ?').get(id) ?? null;
  },

  async findByIds(ids) {
    const db = getDb();
    return (await db.prepare('SELECT * FROM likes WHERE id IN (?)').all(ids)) ?? [];
  },

  async findAll(limit = 50, offset = 0) {
    const db = getDb();
    return (await db.prepare('SELECT * FROM likes ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset)) ?? [];
  },

  async findByUserAndPost(userId, postId) {
    const db = getDb();
    return db.prepare('SELECT * FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId) ?? null;
  },

  async findByPostId(postId, limit = 100, offset = 0) {
    const db = getDb();
    return db
      .prepare('SELECT * FROM likes WHERE post_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(postId, limit, offset);
  },

  async findByUserId(userId, limit = 50, offset = 0) {
    const db = getDb();
    return db
      .prepare('SELECT * FROM likes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(userId, limit, offset);
  },

  async create({ userId, postId }) {
    const db = getDb();
    const existing = likeRepository.findByUserAndPost(userId, postId);
    if (existing) return existing;

    const result = db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
    return likeRepository.findById(result.lastInsertRowid);
  },

  async delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM likes WHERE id = ?').run(id);
  },

  async deleteByUserAndPost(userId, postId) {
    const db = getDb();
    return db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
  },

  async getCountByPost(postId) {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);
    return row?.count ?? 0;
  },

  async hasUserLikedPost(userId, postId) {
    return likeRepository.findByUserAndPost(userId, postId) !== null;
  },
};
