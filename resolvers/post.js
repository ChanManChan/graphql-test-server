const { gql } = require('apollo-server-express');
const posts = require('../temp');

const totalPosts = () => posts.length;
const allPosts = () => posts;
const newPost = (_, { input: { title, description } }) => {
  const post = {
    id: posts.length + 1,
    title,
    description,
  };
  posts.push(post);
  return post;
};

module.exports = {
  Query: {
    totalPosts,
    allPosts,
  },
  Mutation: {
    newPost,
  },
};
