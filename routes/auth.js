import express from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware from '../Middleware/authMiddleware.js';
import httpsMiddleware from '../Middleware/httpsMiddleware.js';
import AuthController from '../Controllers/UserController/AuthController.js';

export const authRouter = express.Router();

/**
 * @route           GET api/auth
 * @description     Get user data by his/her id, this api will work for logged in user
 * @access          Private
 *
 */
authRouter.get('/', httpsMiddleware, authMiddleware, async (req, res) => {
  AuthController.getAuthUserData(req, res);
});

/**
 * @route           GET api/auth/login
 * @description     User will login via this API
 * @access          Public
 */

authRouter.post(
  '/login',
  [
    httpsMiddleware,
    [
      check('email', 'Email is required').not().isEmpty(),
      check('email', 'Valid email is required').isEmail().normalizeEmail(),
      check('password', 'Password is Required').not().isEmpty(),
    ],
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }

    AuthController.loginUser(req, res);
  }
);

/**
 * @route          PUT api/auth/forgot
 * @description    If user forgot his/her password, she/he will be able to change password
 * @access         Public
 */
authRouter.put('/forgot', httpsMiddleware, async (req, res) => {});

/**
 * @route          PUT api/auth/changepassword
 * @description    User will be able to update/change his/her password,
 * @access         Private
 */
//NOTE : in this method, we have to check user's current password before applying any changes and also we may also need to send verification code to his/her mail before updating the password
authRouter.put(
  '/changepassword',
  httpsMiddleware,
  authMiddleware,
  async (req, res) => {}
);
