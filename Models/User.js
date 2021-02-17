import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    requried: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  isActive: {
    //when user confirms his/her email this will be true, if user deactives his/her accout, this will be false
    type: Boolean,
    default: false,
  },
  isConfirmed: {
    //When user confirms his/her email this will be true
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model('users', UserSchema);

export default User;
