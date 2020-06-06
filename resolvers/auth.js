const { authCheck } = require('../helpers/auth');
const User = require('../models/user');
const shortId = require('shortid');

const me = async (_, _a, { req }) => {
  await authCheck(req);
  return 'Nandu';
};

const createUser = async (_, _a, { req }) => {
  const { email } = await authCheck(req);
  const user = await User.findOne({ email });
  return user ? user : new User({ email, username: shortId.generate() }).save();
};

module.exports = {
  Query: {
    me,
  },
  Mutation: {
    createUser,
  },
};
