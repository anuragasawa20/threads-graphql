/**
 * Follower Repository
 *
 * Data access layer for Follower entity.
 * follower_id follows following_id.
 */

import { getDb } from '../db/index.js';

export const followerRepository = {
  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM followers WHERE id = ?').get(id) ?? null;
  },

  findByFollowerAndFollowing(followerId, followingId) {
    const db = getDb();
    return db
      .prepare('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?')
      .get(followerId, followingId) ?? null;
  },

  findFollowers(userId, limit = 50, offset = 0) {
    const db = getDb();
    return db
      .prepare(
        'SELECT * FROM followers WHERE following_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .all(userId, limit, offset);
  },

  findFollowing(userId, limit = 50, offset = 0) {
    const db = getDb();
    return db
      .prepare(
        'SELECT * FROM followers WHERE follower_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .all(userId, limit, offset);
  },

  create({ followerId, followingId }) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const db = getDb();
    const existing = followerRepository.findByFollowerAndFollowing(followerId, followingId);
    if (existing) return existing;

    const result = db
      .prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)')
      .run(followerId, followingId);
    return followerRepository.findById(result.lastInsertRowid);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM followers WHERE id = ?').run(id);
  },

  deleteByFollowerAndFollowing(followerId, followingId) {
    const db = getDb();
    return db
      .prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?')
      .run(followerId, followingId);
  },

  getFollowerCount(userId) {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(userId);
    return row?.count ?? 0;
  },

  getFollowingCount(userId) {
    const db = getDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(userId);
    return row?.count ?? 0;
  },

  isFollowing(followerId, followingId) {
    return followerRepository.findByFollowerAndFollowing(followerId, followingId) !== null;
  },
};
