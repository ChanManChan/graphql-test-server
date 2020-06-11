const { authCheck } = require('../helpers/auth');
const User = require('../models/user');
const Post = require('../models/post');

//! SUBSCRIPTIONS (event types)
const POST_ADDED = 'POST_ADDED';
const POST_UPDATED = 'POST_UPDATED';
const POST_DELETED = 'POST_DELETED';

const allPosts = async (_, { page }) => {
  const currentPage = page || 1;
  const perPage = 3;

  return await Post.find({})
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
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

const postCreate = async (_, _a, { req, pubsub }) => {
  const { email } = await authCheck(req);
  if (_a.input.content.trim() === '') throw new Error('Content is required');
  const { _id } = await User.findOne({ email });
  const newPost = (
    await new Post({
      ..._a.input,
      postedBy: _id,
    }).save()
  )
    .populate('postedBy')
    .execPopulate();
  pubsub.publish(POST_ADDED, { postAdded: newPost });
  return newPost;
};

const postUpdate = async (_, { input }, { req, pubsub }) => {
  const { email } = await authCheck(req);
  if (input.content.trim() === '') throw new Error('Content is required');
  else {
    const { _id } = await User.findOne({ email }).exec();
    const postToUpdate = await Post.findById(input._id).exec();
    if (_id.toString() !== postToUpdate.postedBy._id.toString())
      throw new Error('Unauthorized action');
    else {
      const updatedPost = (
        await Post.findByIdAndUpdate(
          input._id,
          { ...input },
          { new: true }
        ).exec()
      )
        .populate('postedBy')
        .execPopulate();
      pubsub.publish(POST_UPDATED, { postUpdated: updatedPost });
      return updatedPost;
    }
  }
};

const postDelete = async (_, { postId }, { req, pubsub }) => {
  const { email } = await authCheck(req);
  const { _id } = await User.findOne({ email }).exec();
  const postToDelete = await Post.findById(postId).exec();
  if (_id.toString() !== postToDelete.postedBy._id.toString())
    throw new Error('Unauthorized action');
  else {
    const deletedPost = await Post.findByIdAndDelete(postId).exec();
    pubsub.publish(POST_DELETED, { postDeleted: deletedPost });
    return deletedPost;
  }
};

const search = async (_, { query }, ctx) => {
  return await Post.find({ $text: { $search: query } })
    .populate('postedBy')
    .exec();
};

module.exports = {
  Query: {
    allPosts,
    postsByUser,
    singlePost,
    totalPosts,
    search,
  },
  Mutation: {
    postCreate,
    postUpdate,
    postDelete,
  },
  Subscription: {
    postAdded: {
      subscribe: (_, _a, { pubsub }) => pubsub.asyncIterator([POST_ADDED]),
    },
    postUpdated: {
      subscribe: (_, _a, { pubsub }) => pubsub.asyncIterator([POST_UPDATED]),
    },
    postDeleted: {
      subscribe: (_, _a, { pubsub }) => pubsub.asyncIterator([POST_DELETED]),
    },
  },
};
