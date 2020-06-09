const { authCheck } = require('../helpers/auth');
const User = require('../models/user');
const shortId = require('shortid');
const { DateTimeResolver } = require('graphql-scalars');

const profile = async (_, _a, { req }) => {
  const { email } = await authCheck(req);
  return await User.findOne({ email }).exec();
};

const createUser = async (_, _a, { req }) => {
  const { email } = await authCheck(req);
  const user = await User.findOne({ email });
  return user ? user : new User({ email, username: shortId.generate() }).save();
};

const userUpdate = async (_, { input }, { req }) => {
  const { email } = await authCheck(req);
  const updatedUser = await User.findOneAndUpdate(
    { email },
    { ...input },
    { new: true }
  ).exec();
  return updatedUser;
};

const publicProfile = async (_, { username }, ctx) =>
  await User.findOne({ username }).exec();

const allUsers = async (_, _a, ctx) => await User.find({}).exec();

module.exports = {
  Query: {
    profile,
    publicProfile,
    allUsers,
  },
  Mutation: {
    createUser,
    userUpdate,
  },
};
