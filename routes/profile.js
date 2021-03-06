import express from 'express';
import { check, checkSchema, validationResult } from 'express-validator';
import messageCodes from '../messages/processCodes.js';
import { userNameVerification } from '../Utils/usernameVerification.js';
import {
  checkCountryName,
  getCities,
  checkCityName,
} from '../Utils/countryValidation.js';
import UserProfileController from '../Controllers/ProfileController/ProfileController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import semiAuthMiddleware from '../Middleware/semiAuthMiddleware.js';
import httpsMiddleware from '../Middleware/httpsMiddleware.js';

export const profilesRouter = express.Router();

/**
 * @route           GET api/profile/myprofile
 * @description     Get Current User Profile (When user enters his/her profile)
 * @access          Private
 */
profilesRouter.get(
  '/myprofile',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    UserProfileController.getMyProfile(req, res);
  }
);

/**
 * @route           GET api/profile/user/:id
 * @description     Get profile of another user (auth user will be able to enter profiles of other users if they are not private, if they are private and is a following of the user)
 * @access          Private/Public (depends on the user privacy options)
 */
profilesRouter.get(
  '/user/:id',
  httpsMiddleware,
  semiAuthMiddleware,

  (req, res) => {
    UserProfileController.getUserProfileById(req, res);
  }
);

/**
 * TODO: Not Completed
 * @route           POST api/profile/user/coverphoto
 * @description     Upload Cover Photo of User
 * @access          Private
 */
profilesRouter.post(
  '/coverphoto',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    UserProfileController.uploadUserCoverPhoto(req, res);
  }
);

/**
 * TODO: Not Completed
 * @route           POST api/profile/user/avatar
 * @description     Upload Avatar of User
 * @access          Private
 */
profilesRouter.post('/avatar', httpsMiddleware, authMiddleware, (req, res) => {
  UserProfileController.uploadUserAvatar(req, res);
});

/**
 * @route         POST api/profile
 * @description   Create Profile of User
 * @access        Private
 */
profilesRouter.post(
  '/',

  httpsMiddleware,
  authMiddleware,
  checkSchema({
    username: {
      isString: {
        errorMessage: 'username must be string',
      },
      custom: {
        options: (value, { req }) => {
          return userNameVerification(req.body.username);
        },
        errorMessage: messageCodes['Username Error'],
      },
      isLength: {
        errorMessage: 'username should be at most 50 characters',
        options: { max: 50 },
      },
      trim: true,
      escape: true,
    },
    website: {
      isURL: {
        errorMessage: messageCodes['Not Valid Website'],
        options: {
          protocols: ['http', 'https'],
          require_protocol: true,
          require_valid_protocol: true,
          allow_trailing_dot: false,
        },
      },
    },
    country: {
      isLength: {
        errorMessage: 'Country Name (location) should be at most 75 characters',
        options: { max: 75 },
      },
      custom: {
        errorMessage: 'Please Enter a Valid Country',
        options: (value, { req }) => {
          if (req.body.country) {
            return checkCountryName(req.body.country);
          }
          return true;
        },
      },
    },
    'contactInfo.address.street': {
      isLength: {
        errorMessage: 'Street should be at most 120 characters',
        options: { max: 120 },
      },
    },
    'contactInfo.address.city': {
      isLength: {
        errorMessage: 'City should be at most 40 characters',
        options: { max: 40 },
      },
      custom: {
        errorMessage: 'Please enter a valid city',
        options: (value, { req }) => {
          const country = req.body.country;
          const city = req.body.contactInfo.address.city;

          if (country && checkCountryName(country)) {
            const cities = getCities(country);
            return checkCityName(city) && cities.includes(city.toLowerCase());
          }

          return checkCityName(city);
        },
      },
    },
  }),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }

    UserProfileController.createProfile(req, res);
  }
);

/**
 * 

  contactInfo: {
    address: {
      street: {
        type: String,
        maxLength: 120,
      },
      city: {
        type: String,
        maxLenght: 30,
      },
      postCode: {
        type: String,
        maxLenght: 15,
      },
      fullAddress: {
        type: String,
        maxLength: 250,
      },
    },
    mobile: {
      type: String,
      maxLength: 15,
    },
    homePhone: {
      type: String,
      maxLength: 15,
    },
  },
  languages: {
    type: [
      {
        language: {
          type: String,
          maxLength: 30,
        },
        ISO639Code: {
          type: String,
          maxLength: 2,
        },
      },
    ],
    validate: [languageLimit, '{PATH} exceeds the limit of 20'],
  },
  status: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  birthDate: {
    type: Date,
  },
  githubusername: {
    type: String,
    maxLength: 40,
  },
  tellAboutYourself: {
    type: String,
    maxLenght: 8000,
  },
  experience: {
    type: [
      {
        title: {
          type: String,
          required: true,
          maxLength: 60,
        },
        company: {
          type: String,
          required: true,
          maxLength: 150,
        },
        location: {
          type: String,
          maxLength: 75,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          maxLength: 1000,
        },
        salaryRange: {
          type: String,
          maxLength: 20,
        },
      },
    ],
    validation: [experienceLimit, '{PATH} exceeds the limit of 25'],
  },
  education: {
    type: [
      {
        school: {
          type: String,
          required: true,
          maxLength: 90,
        },
        degree: {
          type: String,
          required: true,
          maxLength: 30,
        },
        fieldOfStudy: {
          type: String,
          required: true,
          maxLength: 60,
        },
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: String,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          maxLength: 1000,
        },
      },
    ],
    validation: [educationLimit, '{PATH} exceeds the limit of 8'],
  },
  certificates: {
    type: [
      {
        subject: {
          type: String,
          required: true,
          maxLength: 80,
        },
        issuingOrganization: {
          type: String,
          required: true,
          maxLength: 100,
        },
        issueDate: {
          type: Date,
          required: true,
        },
        expirationDate: {
          type: String,
        },
        doesExpire: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          maxLength: 400,
        },
      },
    ],
    validation: [certificationLimit, '{PATH} exceeds the limit of 35'],
  },
  publications: {
    type: [
      {
        title: {
          type: String,
          required: true,
          maxLength: 120,
        },
        publishedDate: {
          type: Date,
          required: true,
        },
        language: {
          type: String,
          required: true,
          maxLength: 30,
        },
        description: {
          type: String,
          maxLength: 2000,
        },
      },
    ],
    validation: [publicationsLimit, '{PATH} exceeds the limit of 25'],
  },
  portfolio: {
    type: [
      {
        title: {
          type: String,
          required: true,
          maxLength: 100,
        },
        subject: {
          type: String,
          required: true,
          maxLength: 100,
        },
        targetAudience: {
          type: String,
          maxLength: 200,
        },
        dateOfCreation: {
          type: Date,
          required: true,
        },
        description: {
          type: String,
          maxLength: 6500,
        },
        projectDuration: {
          duration: {
            type: Number,
            max: 365,
          },
          unit: {
            type: String,
            maxLength: 20,
          },
        },
        toolsUsed: {
          type: [String],
        },
        imagesArray: {
          type: [
            {
              imageLink: {
                type: String,
              },
              imageDescription: {
                type: String,
                maxLenght: 500,
              },
              imageTitle: {
                type: String,
                maxLength: 100,
              },
              uploadDate: {
                type: Date,
                default: Date.now(),
              },
            },
          ],
          validation: [imageLimit, '{PATH} exceeds the limit of 25'], //image Limitation per portfolio
        },
        videoArray: {
          type: [
            {
              videoLink: {
                type: String,
              },
              videoDescription: {
                type: String,
                maxLenght: 500,
              },
              videoTitle: {
                type: String,
                maxLength: 100,
              },
              uploadDate: {
                type: Date,
                default: Date.now(),
              },
            },
          ],
          validation: [videoLimit, '{PATH} exceeds the limit of 5'], //video Limitation per portfolio
        },
        websiteLink: {
          type: String,
          maxLength: 100,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    validation: [portfolioLimit, '{PATH} exceeds the limit of 100'], //PortfolioLimitation
  },
  social: {
    youtube: {
      type: String,
      maxLength: 100,
    },
    twitter: {
      type: String,
      maxLength: 40,
    },
    facebook: {
      type: String,
      maxLength: 80,
    },
    linkedin: {
      type: String,
      maxLength: 100,
    },
    instagram: {
      type: String,
      maxLength: 100,
    },
  },
  avatar: {
    //when user upload avatar, avatar in user model should also change
    avatarImageId: {
      type: String,
    },
  },
  coverPhoto: {
    //we need to get Id of cover photo from UserImages and assign here. Cover photo and avatar should be uploaded seperately
    //That is, should be saved with different API and assigned to here...
    coverPhotoImageId: {
      type: String,
    },
  },
  posts: [
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
 */

//TODO :
/**
  Think about anonymous users. We may show limited profile to anonymous users if the user privacy option for private accout is false
  that is if the user's profile is public. Even if is public, an auth user should be able to see complete profile but for anonymous
  users, we need to show a limited amout from profile (For example; Cover Page, Avatar, Name & Surname, Profession and a login/sign up button) and
  we must present the signup or signin options to anonymous user to see all profile if it is public. If user has a private account, these accounts
  must be completely hidden to anonymous users. In this case, the above must work for both types of users but the authentication should be controlled
  inside the contoller 
*/
