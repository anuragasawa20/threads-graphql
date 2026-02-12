/**
 * Threads Learning App - Server Entry Point
 * 
 * Stack: Node.js + Express + Apollo GraphQL + SQLite
 */

import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { initDb } from './db/index.js';
import { getUserFromRequest } from './auth/jwt.js';
import { createDataLoader } from './graphql/dataloader.js';

// Initialize database
initDb();

const app = express();
const PORT = process.env.PORT || 4000;

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(cors());
app.use(express.json());
app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => ({
      user: getUserFromRequest(req),
      loaders: createDataLoader(),
    }),
  })
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GraphQL playground at http://localhost:${PORT}/graphql`);
});
