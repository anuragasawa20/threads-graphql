/**
 * GraphQL Schema
 * 
 * Defines the shape of your API - types, queries, mutations.
 * Schema-first approach: define types first, then implement resolvers.
 */

export const typeDefs = `#graphql

  type User {
    id: ID!
    username: String!
    email: String!
    display_name: String
  }

  type Post {
    id:ID!
    content: String!
    author: User!
    created_at: String!
    updated_at: String!
  }

  type Likes{
    id: ID!
    user: User!
    post: Post!
    created_at: String!
  }

  "Returned by login - contains JWT and user info"
  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    "Health check - confirms GraphQL is working"
    hello: String
    getAllUsers:[User]
    getUser(id: ID!): User
    getPost(id: ID!): Post
    getAllPosts(limit: Int, offset: Int): [Post]
    getPostsByUser(userId: ID!, limit: Int, offset: Int): [Post]
    getAllLikes:[Likes]
    getLikes(post_id: ID!): [Likes]
  }

  type Mutation {
    _placeholder: Boolean
    createUser(username: String!, email: String!, password: String!, displayName: String): User
    "Login with email + password. Returns JWT token."
    login(email: String!, password: String!): AuthPayload
    "Create post - requires Authorization: Bearer <token> header. User from JWT."
    createPost(content: String!): Post
  }
`;
