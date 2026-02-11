/**
 * Join-based queries to avoid N+1 when loading lists with relations.
 *
 * Use these in root Query resolvers (getAllPosts, getPostsByUser, getLikes, getAllLikes)
 * so that each item already has author/user/post attached. Then in type resolvers
 * (Post.author, Likes.user, Likes.post) return parent.author / parent.user / parent.post
 * when present, and only fall back to findById when the data came from a single-item
 * query (e.g. getPost(id)) that didn't use a join.
 *
 * @see server/docs/n1-tradeoffs.md for DataLoader vs Join tradeoffs.
 */

import { getDb } from '../db/index.js';

// --- Posts with author (single query) ---

const POSTS_WITH_AUTHOR_SQL = `
  SELECT
    p.id AS id,
    p.user_id AS user_id,
    p.content AS content,
    p.created_at AS created_at,
    p.updated_at AS updated_at,
    u.id AS author_id,
    u.username AS author_username,
    u.email AS author_email,
    u.display_name AS author_display_name
  FROM posts p
  INNER JOIN users u ON p.user_id = u.id
  ORDER BY p.created_at DESC
  LIMIT ? OFFSET ?
`;

function mapRowToPostWithAuthor(row) {
  return {
    id: String(row.id),
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: String(row.author_id),
      username: row.author_username,
      email: row.author_email,
      display_name: row.author_display_name ?? null,
    },
  };
}

/**
 * All posts with author loaded in one query. Use for getAllPosts.
 */
export function findAllPostsWithAuthor(limit = 50, offset = 0) {
  const db = getDb();
  const rows = db.prepare(POSTS_WITH_AUTHOR_SQL).all(limit, offset);
  return rows.map(mapRowToPostWithAuthor);
}

/**
 * Posts by one user with author loaded in one query. Use for getPostsByUser.
 */
export function findPostsByUserWithAuthor(userId, limit = 50, offset = 0) {
  const db = getDb();
  const sql = `
    SELECT
      p.id AS id,
      p.user_id AS user_id,
      p.content AS content,
      p.created_at AS created_at,
      p.updated_at AS updated_at,
      u.id AS author_id,
      u.username AS author_username,
      u.email AS author_email,
      u.display_name AS author_display_name
    FROM posts p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const rows = db.prepare(sql).all(userId, limit, offset);
  return rows.map(mapRowToPostWithAuthor);
}

/**
 * Single post by id with author. Use for getPost(id) when you want to avoid a second query for author.
 */
export function findPostByIdWithAuthor(id) {
  const db = getDb();
  const sql = `
    SELECT
      p.id AS id,
      p.user_id AS user_id,
      p.content AS content,
      p.created_at AS created_at,
      p.updated_at AS updated_at,
      u.id AS author_id,
      u.username AS author_username,
      u.email AS author_email,
      u.display_name AS author_display_name
    FROM posts p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `;
  const row = db.prepare(sql).get(id);
  return row ? mapRowToPostWithAuthor(row) : null;
}

// --- Likes with user and post (single query) ---

const LIKES_WITH_USER_AND_POST_SQL = `
  SELECT
    l.id AS id,
    l.user_id AS user_id,
    l.post_id AS post_id,
    l.created_at AS created_at,
    u.id AS u_id,
    u.username AS u_username,
    u.email AS u_email,
    u.display_name AS u_display_name,
    p.id AS p_id,
    p.user_id AS p_user_id,
    p.content AS p_content,
    p.created_at AS p_created_at,
    p.updated_at AS p_updated_at
  FROM likes l
  INNER JOIN users u ON l.user_id = u.id
  INNER JOIN posts p ON l.post_id = p.id
  ORDER BY l.created_at DESC
  LIMIT ? OFFSET ?
`;

const LIKES_BY_POST_WITH_USER_AND_POST_SQL = `
  SELECT
    l.id AS id,
    l.user_id AS user_id,
    l.post_id AS post_id,
    l.created_at AS created_at,
    u.id AS u_id,
    u.username AS u_username,
    u.email AS u_email,
    u.display_name AS u_display_name,
    p.id AS p_id,
    p.user_id AS p_user_id,
    p.content AS p_content,
    p.created_at AS p_created_at,
    p.updated_at AS p_updated_at
  FROM likes l
  INNER JOIN users u ON l.user_id = u.id
  INNER JOIN posts p ON l.post_id = p.id
  WHERE l.post_id = ?
  ORDER BY l.created_at DESC
  LIMIT ? OFFSET ?
`;

function mapRowToLikeWithUserAndPost(row) {
  return {
    id: String(row.id),
    user_id: row.user_id,
    post_id: row.post_id,
    created_at: row.created_at,
    user: {
      id: String(row.u_id),
      username: row.u_username,
      email: row.u_email,
      display_name: row.u_display_name ?? null,
    },
    post: {
      id: String(row.p_id),
      user_id: row.p_user_id,
      content: row.p_content,
      created_at: row.p_created_at,
      updated_at: row.p_updated_at,
    },
  };
}

/**
 * All likes with user and post loaded in one query. Use for getAllLikes.
 */
export function findAllLikesWithUserAndPost(limit = 50, offset = 0) {
  const db = getDb();
  const rows = db.prepare(LIKES_WITH_USER_AND_POST_SQL).all(limit, offset);
  return rows.map(mapRowToLikeWithUserAndPost);
}

/**
 * Likes for a given post with user and post loaded in one query. Use for getLikes(post_id).
 */
export function findLikesByPostIdWithUserAndPost(postId, limit = 100, offset = 0) {
  const db = getDb();
  const rows = db.prepare(LIKES_BY_POST_WITH_USER_AND_POST_SQL).all(postId, limit, offset);
  return rows.map(mapRowToLikeWithUserAndPost);
}
