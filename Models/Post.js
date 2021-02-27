import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled',
    maxLength: 50,
  },
  text: {
    type: String,
    maxLenght: 9500,
  },
  postedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  postType: {
    type: String,
    default: 'portfolio',
    maxLength: 25,
  },
  imageLinks: {
    type: [
      {
        imageName: {
          type: String,
          maxLength: 100,
        },
        imageLink: {
          type: String,
          maxLength: 220,
        },
      },
    ],
    validate: [imagesLimit, '{PATH} exceeds the limit of 20'],
  },
  numberOfLikes: {
    type: Number,
    default: 0,
    max: 9000000000,
  },
  likes: {
    type: [
      {
        likedBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
          },
        },
        likedDate: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    validate: [likesLimit, '{PATH} exceeds the limit of 160000'],
  },
  numberOfShares: {
    type: Number,
    default: 0,
    max: 9000000000,
  },
  shares: {
    type: [
      {
        sharedBy: {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
          },
        },
        sharedDate: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    validate: [sharesLimit, '{PATH} exceeds the limit of 25000'],
  },
  numberOfComments: {
    //In each time a comment or subcomment added to the post under given Id, this will be increased by 1 and if a user removes a comment or subcomment, will be decreased by 1
    //If a user deletes a comment and that comment also contains 1 or more subcomments, total count will be decreased from numberOfComments for this post
    type: Number,
    default: 0,
    max: 9000000000,
  },
  postContentLink: {
    //If user would like to forward to another website for the article, s/he will add the link to postContentLink area
    type: String,
    maxLength: 220,
  },

  postPrivacyOptions: {
    onlyFollowers: {
      type: Boolean,
      default: true,
    },
    onlyMe: {
      type: Boolean,
      default: false,
    },
    public: {
      type: Boolean,
      default: false,
    },
    specificFollowers: [
      {
        follower: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users',
        },
      },
    ],
    allFollowersExcept: [
      {
        follower: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users',
        },
      },
    ],
  },

  postedAt: {
    type: Date,
    default: Date.now(),
  },
});

//TODO : TEST Limit Functions for Likes, Images and Shares

function likesLimit(val) {
  val.length <= 160000;
}

function sharesLimit(val) {
  val.length <= 25000;
}

function imagesLimit(val) {
  val.length <= 20;
}

const Post = mongoose.model('posts', PostSchema);

export default Post;
