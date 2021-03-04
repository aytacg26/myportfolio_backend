import express from 'express';
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

//TODO :
/**
  Think about anonymous users. We may show limited profile to anonymous users if the user privacy option for private accout is false
  that is if the user's profile is public. Even if is public, an auth user should be able to see complete profile but for anonymous
  users, we need to show a limited amout from profile (For example; Cover Page, Avatar, Name & Surname, Profession and a login/sign up button) and
  we must present the signup or signin options to anonymous user to see all profile if it is public. If user has a private account, these accounts
  must be completely hidden to anonymous users. In this case, the above must work for both types of users but the authentication should be controlled
  inside the contoller 
*/
