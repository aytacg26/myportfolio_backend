import mongoose from 'mongoose';

const BlockedUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  blockedUser: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },

  blockedDate: {
    type: Date,
    default: Date.now(),
  },
});

const BlockedUser = mongoose.model('blockedUsers', BlockedUserSchema);

export default BlockedUser;
