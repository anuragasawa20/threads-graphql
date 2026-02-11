# Threads Learning App

A Threads-like app built for **learning Node.js and GraphQL** — feature by feature, with progressive difficulty.

## Stack

| Layer   | Tech              |
|---------|-------------------|
| Backend | Node.js + Express |
| API     | GraphQL (Apollo Server) |
| Database| SQLite (better-sqlite3) |
| Auth    | Email + Password (bcrypt) |
| Frontend| React (minimal, Vite) |

## Project Structure

```
threads/
├── server/                 # Backend
│   ├── src/
│   │   ├── index.js       # Entry point
│   │   ├── db/            # Database layer
│   │   ├── repositories/  # Data access (one file per entity)
│   │   ├── graphql/       # Schema + resolvers
│   │   └── config/
│   └── data/              # SQLite DB files
├── client/                 # Minimal React frontend
│   └── src/
│       ├── graphql/       # GraphQL client setup
│       └── ...
└── package.json
```

## Setup

```bash
# Install all dependencies (workspaces)
npm install

# Run server (GraphQL at http://localhost:4000/graphql)
npm run dev:server

# Run client (in another terminal)
npm run dev:client
```

## Learning Roadmap (Feature by Feature)

### Level 1: Foundations
1. **Hello GraphQL** — Schema, resolvers, basic query (✅ scaffolded)
2. **User model** — SQLite table, repository, GraphQL User type
3. **Register** — Mutation, bcrypt, validation

### Level 2: Auth & Core
4. **Login** — Mutation, session/JWT basics
5. **Auth context** — Protected resolvers, middleware
6. **Post model** — Threads/posts, repository, schema

### Level 3: GraphQL Nuances
7. **Nested resolvers** — User → Posts, Post → Author
8. **Arguments & pagination** — `posts(limit, offset)`
9. **Input types** — Clean mutation inputs

### Level 4: Features
10. **Create post** — Mutation with auth
11. **Feed** — Query posts, ordering
12. **Like/Reply** — Relations, nested types

---

**Note:** Build one feature at a time. Each step reinforces Node.js, GraphQL, and repository patterns.
