import express from 'express';
import { check, validationResult } from 'express-validator';
import UserController from '../Controllers/UserController/UserController.js';

export const usersRouter = express.Router();

/**
 * @route           GET api/users
 * @description     Get all active and verified users from database
 * @access          Public
 */

usersRouter.get('/', (req, res) => {
  UserController.GetAllUsers(res);
});

/**
 * @route           Post api/users/user/:id/verifyemail/:verificationToken
 * @description     This will verify the user email according to the token
 * @access          Public by user (Only user will be able to send this code)
 */
usersRouter.post('/verifyemail/:id/:verificationToken', (req, res) => {
  UserController.verifyEmail(req, res);
});

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
    check('name', 'Name is required')
      .not()
      .isEmpty()
      .isLength({ min: 2 })
      .trim()
      .escape(),
    check('surname', 'Surname is required')
      .not()
      .isEmpty()
      .isLength({ min: 2 })
      .trim()
      .escape(),
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail().normalizeEmail(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'Minimum length for password must be 6').isLength({
      min: 6,
    }),
    check(
      'confirmPassword',
      'password confirmation field must have the same value as the password field'
    )
      .exists()
      .custom((value, { req }) => value === req.body.password),
    check('gender', 'Gender is required').not().isEmpty(),
  ],

  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }

    UserController.UserRegistration(req, res);
  }
);
