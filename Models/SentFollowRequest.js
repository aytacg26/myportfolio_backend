import mongoose from 'mongoose';

const SendFollowRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  toUser: {
    userId: {
      type: String,
      required: true,
    },
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  hasRejected: {
    type: Boolean,
    default: false,
  },

  requestDate: {
    type: Date,
    default: Date.now(),
  },
});

const SendFollowRequest = mongoose.model(
  'sendFollowRequests',
  SendFollowRequestSchema
);

export default SendFollowRequest;
