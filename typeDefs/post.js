const { gql } = require('apollo-server-express');

module.exports = gql`
  type Post {
    _id: ID!
    content: String
    image: Image
    postedBy: User
    createdAt: String
  }
  input PostCreateInput {
    content: String!
    image: ImageInput
  }
  input PostUpdateInput {
    _id: ID!
    content: String!
    image: ImageInput
  }
  type Query {
    allPosts: [Post!]!
    postsByUser: [Post!]!
    singlePost(postId: ID!): Post!
    totalPosts: Int!
  }
  type Mutation {
    postCreate(input: PostCreateInput!): Post!
    postUpdate(input: PostUpdateInput!): Post!
    postDelete(postId: ID!): Post!
  }
`;
