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
    allPosts(page: Int): [Post!]!
    postsByUser: [Post!]!
    singlePost(postId: ID!): Post!
    totalPosts: Int!
    search(query: String): [Post]
  }
  type Mutation {
    postCreate(input: PostCreateInput!): Post!
    postUpdate(input: PostUpdateInput!): Post!
    postDelete(postId: ID!): Post!
  }
  # whenever new post is created, i want to trigger the event so that all the connected clients are aware of this change (real time)
  type Subscription {
    postAdded: Post
    postUpdated: Post
    postDeleted: Post
  }
`;
