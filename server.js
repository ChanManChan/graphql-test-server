const { ApolloServer } = require('apollo-server-express');
const express = require('express');
require('colors');
require('dotenv').config();
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { authCheckMiddleware } = require('./helpers/auth');
const cors = require('cors');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary');
const mongoose = require('mongoose');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

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

app.get('/rest', (req, res) => {
  res.json({
    data: 'REST endpoint hit',
  });
});

app.post('/uploadimages', authCheckMiddleware, (req, res) => {
  cloudinary.uploader.upload(
    // "req.body.image" <- binary data of the image
    req.body.image,
    (result) => {
      res.send({ url: result.secure_url, public_id: result.public_id });
    },
    //"public_id" <- public name ; "resource_type: 'auto'" <- JPEG/ PNG
    { public_id: `${Date.now()}`, resource_type: 'auto' }
  );
});

app.post('/removeimage', authCheckMiddleware, (req, res) => {
  let image_id = req.body.public_id;
  cloudinary.uploader.destroy(image_id, (err, result) => {
    if (err) return res.json({ success: false, error: err });
    res.send('ok');
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
