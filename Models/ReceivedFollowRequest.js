import mongoose from 'mongoose';

const ReceivedFollowRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  fromUser: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  hasRejected: {
    type: Boolean,
    defalut: false,
  },
  WillSeenOnRequestList: {
    type: Boolean,
    default: true,
  },
  hasRequestSeen: {
    type: Boolean,
    default: false,
  },
  requestDate: {
    type: Date,
    default: Date.now(),
  },
});

const ReceivedFollowRequest = mongoose.model(
  'receivedFollowRequests',
  ReceivedFollowRequestSchema
);

export default ReceivedFollowRequest;
