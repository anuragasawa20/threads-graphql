/**
 * User Repository
 *
 * Data access layer for User entity.
 * All user-related database operations go here.
 */

import { getDb } from '../db/index.js';

export const userRepository = {
  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) ?? null;
  },

  findByEmail(email) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) ?? null;
  },

  findByUsername(username) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username) ?? null;
  },

  findAll(limit = 50, offset = 0) {
    const db = getDb();
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  },

  create({ username, email, passwordHash, displayName = null, avatarUrl = null, bio = null }) {
    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO users (username, email, password_hash, display_name, avatar_url, bio)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(username, email, passwordHash, displayName, avatarUrl, bio);
    return userRepository.findById(result.lastInsertRowid);
  },

  update(id, { username, email, displayName, avatarUrl, bio }) {
    const db = getDb();
    const user = userRepository.findById(id);
    if (!user) return null;

    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (displayName !== undefined) {
      updates.push('display_name = ?');
      values.push(displayName);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }

    if (updates.length === 0) return user;

    updates.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return userRepository.findById(id);
  },

  updatePassword(id, passwordHash) {
    const db = getDb();
    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?').run(
      passwordHash,
      id
    );
    return userRepository.findById(id);
  },

  delete(id) {
    const db = getDb();
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },
};
