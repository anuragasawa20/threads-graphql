/**
 * JWT Auth Utilities
 *
 * Flow: Client sends "Authorization: Bearer <token>" header
 *       -> We extract token, verify it, get userId from payload
 *       -> Pass user in context to resolvers
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(userId) {
  return jwt.sign({ userId: String(userId) }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Extract user from request - looks at Authorization header
 * Returns { userId } or null if invalid/missing
 */
export function getUserFromRequest(req) {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7); // Remove "Bearer "
  const userId = verifyToken(token);
  return userId ? { userId } : null;
}
