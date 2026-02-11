/**
 * Comment Repository
 *
 * Data access layer for Comment entity.
 * Supports nested replies via parent_id.
 */

import { getDb } from '../db/index.js';

export const commentRepository = {
  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM comments WHERE id = ?').get(id) ?? null;
  },

  findByPostId(postId, limit = 100, offset = 0) {
    const db = getDb();
    return db
      .prepare(
        'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?'
      )
      .all(postId, limit, offset);
  },

  findByUserId(userId, limit = 50, offset = 0) {
    const db = getDb();
    return db
      .prepare(
        'SELECT * FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
      )
      .all(userId, limit, offset);
  },

  findByParentId(parentId) {
    const db = getDb();
    return db.prepare('SELECT * FROM comments WHERE parent_id = ? ORDER BY created_at ASC').all(parentId);
  },

  create({ postId, userId, parentId = null, content }) {
    const db = getDb();
    const result = db
      .prepare(
        'INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)'
      )
      .run(postId, userId, parentId, content);
    return commentRepository.findById(result.lastInsertRowid);
  },

  update(id, { content }) {
    const db = getDb();
    const comment = commentRepository.findById(id);
    if (!comment) return null;

    db.prepare('UPDATE comments SET content = ?, updated_at = datetime("now") WHERE id = ?').run(
      content,
      id
    );
    return commentRepository.findById(id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM comments WHERE id = ?').run(id);
  },
};
