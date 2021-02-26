import mongoose from 'mongoose';

const RejectedFollowerSchema = new mongoose.Schema({
  user: {
    //The auth user who rejected the follow request of requester
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  rejectedUser: {
    //follow request rejected user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },

  hasRejected: {
    type: Boolean,
    default: true,
  },

  rejectDate: {
    type: Date,
    default: Date.now(),
  },
});

const RejectedFollower = mongoose.model(
  'rejectedFollowRequests',
  RejectedFollowerSchema
);

export default RejectedFollower;
