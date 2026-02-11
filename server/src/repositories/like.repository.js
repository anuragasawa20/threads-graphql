/**
 * Like Repository
 *
 * Data access layer for Like entity (likes on posts).
 */

import { getDb } from '../db/index.js';

export const likeRepository = {
  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM likes WHERE id = ?').get(id) ?? null;
  },

  findAll(limit = 50, offset = 0) {
    const db = getDb();
    return db.prepare('SELECT * FROM likes ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  },

  findByUserAndPost(userId, postId) {
    const db = getDb();
    return db.prepare('SELECT * FROM likes WHERE user_id = ? AND post_id = ?').get(userId, postId) ?? null;
  },

  findByPostId(postId, limit = 100, offset = 0) {
    const db = getDb();
    return db
      .prepare('SELECT * FROM likes WHERE post_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(postId, limit, offset);
  },

  findByUserId(userId, limit = 50, offset = 0) {
    const db = getDb();
    return db
      .prepare('SELECT * FROM likes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(userId, limit, offset);
  },

  create({ userId, postId }) {
    const db = getDb();
    const existing = likeRepository.findByUserAndPost(userId, postId);
    if (existing) return existing;

    const result = db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(userId, postId);
    return likeRepository.findById(result.lastInsertRowid);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM likes WHERE id = ?').run(id);
  },

  deleteByUserAndPost(userId, postId) {
    const db = getDb();
    return db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
  },

  getCountByPost(postId) {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId);
    return row?.count ?? 0;
  },

  hasUserLikedPost(userId, postId) {
    return likeRepository.findByUserAndPost(userId, postId) !== null;
  },
};
