const mongoose = require('mongoose');
const { Types } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    images: {
      type: [Types.Mixed],
      default: [
        {
          url: 'https://via.placeholder.com/150.png?text=Profile',
          public_id: Date.now(),
        },
      ],
    },
    about: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
