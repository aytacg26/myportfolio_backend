import express from 'express';
import { check, validationResult } from 'express-validator';
import UserController from '../Controllers/UserController/UserController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import httpsMiddleware from '../Middleware/httpsMiddleware.js';

export const usersRouter = express.Router();

/**
 * @route           GET api/users
 * @description     Get all active and verified users from database
 * @access          Public
 */

usersRouter.get('/', httpsMiddleware, (req, res) => {
  UserController.GetAllUsers(res);
});

/**
 * @route           Post api/users/user/:id/verifyemail/:verificationToken
 * @description     This will verify the user email according to the token
 * @access          Public by user (Only user will be able to send this code)
 */
usersRouter.post(
  '/verifyemail/:id/:verificationToken',
  httpsMiddleware,
  (req, res) => {
    UserController.verifyEmail(req, res);
  }
);

/**
 * @route           POST api/users
 * @description     User Registration
 * @access          Public
 * To register user, we will use POST api/users, logic for this route will take place in Controllers Folder, data will be checked here and then will be send to controllers
 * 1- Send data should be checked with express-validator. FOR EMAIL VERIFICATION, emailToken added to User Model...
 */
usersRouter.post(
  '/',

  [
    httpsMiddleware,
    [
      check('name', 'Name is required')
        .not()
        .isEmpty()
        .isLength({ min: 2, max: 30 })
        .trim()
        .escape(),
      check('surname', 'Surname is required')
        .not()
        .isEmpty()
        .isLength({ min: 2, max: 30 })
        .trim()
        .escape(),
      check('email', 'Email is required').not().isEmpty().isLength({ max: 80 }),
      check('email', 'Valid email is required').isEmail().normalizeEmail(),
      check('password', 'Password is required').not().isEmpty(),
      check('password', 'Minimum length for password must be 6').isLength({
        min: 6,
      }),
      check('password', 'Maximum length for password must be 20').isLength({
        max: 20,
      }),
      check(
        'confirmPassword',
        'password confirmation field must have the same value as the password field'
      )
        .exists()
        .custom((value, { req }) => value === req.body.password),
      check('gender', 'Gender is required').not().isEmpty(),
    ],
  ],

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }

    UserController.UserRegistration(req, res);
  }
);

/**
 * @route           PUT api/users/updateprivacy/:id
 * @description     User will update his/her privacy settings
 * @access          Private
 */
usersRouter.put(
  '/privacy/:id',
  [
    httpsMiddleware,
    authMiddleware,
    [
      check('privateAccount', 'Must be a boolean with true or false')
        .trim()
        .isBoolean()
        .escape(),
      check('showActivityStatus', 'Must be boolean with true or false')
        .trim()
        .isBoolean()
        .escape(),
      check('postSharing', 'Must be boolean with true or false')
        .trim()
        .isBoolean()
        .escape(),
      check('useTextMessage', 'Must be boolean with true or false')
        .trim()
        .isBoolean()
        .escape(),
      check('useEmailMessage', 'Must be boolean with true or false')
        .trim()
        .isBoolean()
        .escape(),
      check('useAuthenticationApp', 'Must be boolean with true or false')
        .trim()
        .isBoolean()
        .escape(),
    ],
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }

    UserController.privacySettings(req, res);
  }
);
