const { authCheck } = require('../helpers/auth');
const User = require('../models/user');
const Post = require('../models/post');

const allPosts = async (_, _a) => {
  return await Post.find({})
    .populate('postedBy')
    .sort({ createdAt: -1 })
    .exec();
};

const singlePost = async (_, { postId }) => {
  return (await Post.findById(postId).exec())
    .populate('postedBy')
    .execPopulate();
};

const totalPosts = async (_, _a, ctx) =>
  await Post.find({}).estimatedDocumentCount().exec();

const postsByUser = async (_, _a, { req }) => {
  const { email } = await authCheck(req);
  const { _id } = await User.findOne({ email });
  return await Post.find({ postedBy: _id })
    .populate('postedBy')
    .sort({ createdAt: -1 });
};

const postCreate = async (_, _a, { req }) => {
  const { email } = await authCheck(req);
  if (_a.input.content.trim() === '') throw new Error('Content is required');
  const { _id } = await User.findOne({ email });
  return (
    await new Post({
      ..._a.input,
      postedBy: _id,
    }).save()
  )
    .populate('postedBy')
    .execPopulate();
};

const postUpdate = async (_, { input }, { req }) => {
  const { email } = await authCheck(req);
  if (input.content.trim() === '') throw new Error('Content is required');
  else {
    const { _id } = await User.findOne({ email }).exec();
    const postToUpdate = await Post.findById(input._id).exec();
    if (_id.toString() !== postToUpdate.postedBy._id.toString())
      throw new Error('Unauthorized action');
    else
      return (
        await Post.findByIdAndUpdate(
          input._id,
          { ...input },
          { new: true }
        ).exec()
      )
        .populate('postedBy')
        .execPopulate();
  }
};

const postDelete = async (_, { postId }, { req }) => {
  const { email } = await authCheck(req);
  const { _id } = await User.findOne({ email }).exec();
  const postToDelete = await Post.findById(postId).exec();
  if (_id.toString() !== postToDelete.postedBy._id.toString())
    throw new Error('Unauthorized action');
  else return await Post.findByIdAndDelete(postId).exec();
};

module.exports = {
  Query: {
    allPosts,
    postsByUser,
    singlePost,
    totalPosts,
  },
  Mutation: {
    postCreate,
    postUpdate,
    postDelete,
  },
};
