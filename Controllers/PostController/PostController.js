import { errorMessage } from '../../messages/messages.js';
import User from '../../Models/User.js';
import messageCodes from '../../messages/processCodes.js';
import Post from '../../Models/Post.js';

/**
 * @route           POST api/posts
 * @description     Create new Post
 * @access          Private
 */
const createNewPost = async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  //1- Check if user exists, if not, return error
  if (!user) {
    return errorMessage(
      res,
      401,
      'Unauthorized access',
      messageCodes['Unauthorized Access']
    );
  }

  res.json(req.body);
  //const newPost = new Post({})
  //2- If the type of created post is "write article", we will add postId to the Profile Article Array
};

const PostController = Object.freeze({
  createNewPost,
});

export default PostController;

/**
 *   title: {
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
          maxLength: 120,
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
    maxLength: 120,
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
 */
