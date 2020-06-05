const { gql } = require('apollo-server-express');

const me = () => 'Nandu';

module.exports = {
  Query: {
    me,
  },
};
