const { gql } = require('apollo-server-express');

module.exports = gql`
  #scalar type
  scalar DateTime
  type UserCreateResponse {
    username: String!
    email: String!
  }
  type Image {
    url: String
    public_id: String
  }
  type User {
    _id: ID!
    username: String
    name: String
    email: String
    images: [Image]
    about: String
    createdAt: DateTime
    updatedAt: DateTime
  }
  input ImageInput {
    url: String
    public_id: String
  }
  input UserUpdateInput {
    name: String
    username: String
    images: [ImageInput]
    about: String
  }
  type Query {
    profile: User!
    publicProfile(username: String!): User!
    allUsers: [User!]!
  }
  type Mutation {
    createUser: UserCreateResponse!
    userUpdate(input: UserUpdateInput): User
  }
`;
