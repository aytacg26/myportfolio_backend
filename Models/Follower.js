import mongoose from 'mongoose';

const FollowerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },

  follower: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },

    amIFollowing: {
      type: Boolean,
      default: false,
    },
    followStartDate: {
      type: Date,
      default: Date.now(),
    },
  },
});

const Follower = mongoose.model('Followers', FollowerSchema);

export default Follower;
