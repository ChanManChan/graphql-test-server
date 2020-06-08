const { gql } = require('apollo-server-express');

module.exports = gql`
  type UserCreateResponse {
    username: String!
    email: String!
  }
  type Query {
    me: String!
  }
  type Mutation {
    createUser: UserCreateResponse!
  }
`;
