import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled',
    maxLength: 50,
  },
});
