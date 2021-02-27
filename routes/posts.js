import express from 'express';
import { check, checkSchema, oneOf, validationResult } from 'express-validator';
import authMiddleware from '../Middleware/authMiddleware.js';
import httpsMiddleware from '../Middleware/httpsMiddleware.js';
import PostController from '../Controllers/PostController/PostController.js';

export const postsRouter = express.Router();

/**
 * @route           POST api/posts
 * @description     Create new Post
 * @access          Private
 */
//TODO : Check all validations, for now, current validations tested and they are ok!!
postsRouter.post(
  '/',
  httpsMiddleware,
  authMiddleware,
  oneOf([check('x-auth-token').exists()]), //Not necessary, authMiddleware checks for it
  checkSchema({
    title: {
      isString: true,
      isLength: {
        errorMessage: 'Title cannot be more than 50 characters',
        options: { max: 50 },
      },
      trim: true,
      escape: true,
    },
    text: {
      isString: true,
      trim: true,
      escape: true,
      isLength: {
        errorMessage: 'Article Text cannot be more than 9500 characters',
        options: { max: 9500 },
      },
    },
    postType: {
      trim: true,
      escape: true,
      isLength: {
        errorMessage:
          'Please select one of the given options and postType cannot be more than 25 characters',
        options: { max: 25 },
      },
    },
    imageLinks: {
      isArray: {
        errorMessage:
          'Maximum number of images cannot be more than 20, you must upload at most 20 images',
        options: { max: 20, isArray: true },
      },
    },

    'imageLinks.*.imageName': {
      isString: true,
      trim: true,
      escape: true,
      isLength: {
        errorMessage: 'Image Name cannot be more than 100 characters',
        options: { max: 100 },
      },
    },
    'imageLinks.*.imageLink': {
      isString: true,
      trim: true,
      isURL: {
        errorMessage: 'Should be a valid URL',
        options: { isURL: true },
      },
      isLength: {
        errorMessage: 'Image URL cannot be more than 220 characters',
        options: { max: 220 },
      },
    },
    postContentLink: {
      isString: true,
      trim: true,
      isURL: {
        errorMessage: 'Should be a valid URL',
        options: { isURL: true },
      },
      isLength: {
        errorMessage: 'Content URL cannot be more than 220 characters',
        options: { max: 220 },
      },
    },
    'postPrivacyOptions.onlyFollowers': {
      isBoolean: {
        errorMessage: 'Privacy Options must be boolean',
        options: { isBoolean: true },
      },
    },
    'postPrivacyOptions.onlyMe': {
      isBoolean: {
        errorMessage: 'Privacy Options must be boolean',
        options: { isBoolean: true },
      },
    },
    'postPrivacyOptions.public': {
      isBoolean: {
        errorMessage: 'Privacy Options must be boolean',
        options: { isBoolean: true },
      },
    },
    'postPrivacyOptions.specificFollowers': {
      optional: { options: { nullable: true } },
      isArray: {
        errorMessage: 'Specific Followers Privacy Option must be an Array',
        options: { isArray: true },
      },
    },
    'postPrivacyOptions.allFollowersExcept': {
      optional: { options: { nullable: true } },
      isArray: {
        errorMessage: 'All Followers Except Privacy Option must be an Array',
        options: { isArray: true },
      },
    },
  }),

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }

    PostController.createNewPost(req, res);
  }
);
