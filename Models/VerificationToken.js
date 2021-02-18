import mongoose from 'mongoose';

const VerificatioTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
  verificationToken: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expires: {
    type: Number,
    default: new Date().getTime() + 87000000,
  },
});

const VerificationToken = mongoose.model('tokens', VerificatioTokenSchema);

export default VerificationToken;
