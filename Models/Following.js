import mongoose from 'mongoose';

const FollowingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  following: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    profession: {
      type: String,
    },
    followingStartDate: {
      type: Date,
      default: Date.now(),
    },
  },
});

const Following = mongoose.model('followings', FollowingSchema);

export default Following;
