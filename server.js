const { ApolloServer } = require('apollo-server-express');
const express = require('express');
require('colors');
require('dotenv').config();
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { authCheck } = require('./helpers/auth');

const mongoose = require('mongoose');
const path = require('path');

const app = express();

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateindex: true,
      useFindAndModify: false,
    });
    console.log('> DB Connected'.bgWhite.green);
  } catch (e) {
    console.log('> DB Connection error: '.red, e);
  }
})();

const typeDefs = mergeTypeDefs(
  loadFilesSync(path.join(__dirname, './typeDefs')),
  { all: true }
);
const resolvers = mergeResolvers(
  loadFilesSync(path.join(__dirname, './resolvers')),
  { all: true }
);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

// applyMiddleware method connects ApolloServer to a specific HTTP framework such as express
apolloServer.applyMiddleware({ app });

app.get('/rest', authCheck, (req, res) => {
  res.json({
    data: 'REST endpoint hit',
  });
});

app.listen(process.env.PORT, () => {
  console.log(
    `> Server running on http://localhost:${process.env.PORT}`.underline.blue
  );
  console.log(
    `> GraphQl server ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`
      .bgMagenta
  );
});
