import mongoose from 'mongoose';

const ReceivedFollowRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  fromUser: {
    userId: {
      type: String,
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
      required: true,
    },
    profession: {
      type: String,
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
