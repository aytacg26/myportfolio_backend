import mongoose from 'mongoose';

const UserImageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  images: {
    type: [
      {
        imageName: {
          type: String,
          default: 'Untitled',
        },
        uploadDate: {
          type: Date,
          default: Date.now(),
        },
        imageLink: {
          type: String,
        },
        wasCoverImage: {
          type: Boolean,
          default: false,
        },
        wasProfileImage: {
          type: Boolean,
          default: false,
        },
        isExisitingCover: {
          type: Boolean,
          default: false,
        },
        isExistingProfile: {
          type: Boolean,
          default: false,
        },
      },
    ],
    validation: [imageLimit, '{PATH} exceeds the limit of 22000'],
  },
});

function imageLimit(val) {
  val.length <= 22000;
}

const UserImage = mongoose.model('userimages', UserImageSchema);

export default UserImage;
