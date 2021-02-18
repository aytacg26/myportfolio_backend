import express from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware from '../Middleware/authMiddleware.js';
import AuthController from '../Controllers/UserController/AuthController.js';

export const authRouter = express.Router();

/**
 * @route           GET api/auth
 * @description     Get user data by his/her id, this api will work for logged in user
 * @access          Private
 *
 */
authRouter.get('/', authMiddleware, async (req, res) => {
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
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail().normalizeEmail(),
    check('password', 'Password is Required').not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors });
    }

    AuthController.loginUser(req, res);
  }
);
