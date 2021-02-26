import express from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware from '../Middleware/authMiddleware.js';
import httpsMiddleware from '../Middleware/httpsMiddleware.js';
import FollowController from '../Controllers/FollowController/FollowController.js';

export const followRouter = express.Router();

/**
 * @route           GET api/follow/followers
 * @description     Get all followers of authenticated user
 * @access          Private
 */
followRouter.get('/followers', httpsMiddleware, authMiddleware, (req, res) => {
  FollowController.getAllFollowers(req, res);
});

followRouter.get(
  '/followerssize',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.getNumberOfFollowers(req, res);
  }
);

/**
 * @route           GET api/follow/followings
 * @description     Get all followings of authenticated user
 * @access          Private
 */
followRouter.get('/followings', httpsMiddleware, authMiddleware, (req, res) => {
  FollowController.getAllFollowings(req, res);
});

/**
 * @route           GET api/follow/followrequests
 * @description     Get all follow requests to auth user
 * @access          Private
 */
followRouter.get(
  '/followrequests',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.getAllReceivedFollowRequests(req, res);
  }
);

/**
 * @route           GET api/follow/sentfollowrequests
 * @description     Get all sent follow requests by auth user
 * @access          Private
 */
followRouter.get(
  '/sentfollowrequests',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.getAllSentFollowRequests(req, res);
  }
);

/**
 * @route           GET api/follow/listOfRejected
 * @description     Get all rejected follow requests by auth user (This will give the list of users who send follow request to auth user but auth user rejected their request)
 * @access          Private
 */
followRouter.get(
  '/listOfRejected',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.getAllRejectedFollowRequests(req, res);
  }
);

/**
 * @route           DELETE api/follow/:idToRemove
 * @description     Delete a follower from followers list of auth user
 * @access          Private
 */
followRouter.delete(
  '/:idToRemove',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.removeFollower(req, res);
  }
);

/**
 * @route           POST api/follow/accept/:idOfRequester
 * @description     Accept follow request send by another user to the auth user
 * @access          Private
 */
followRouter.post(
  '/accept/:idOfRequester',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.acceptFollowRequest(req, res);
  }
);

/**
 * @route           POST api/follow/reject/:idOfRequester
 * @description     Reject follow request send by another user to the auth user
 * @access          Private
 */
followRouter.post(
  '/reject/:idOfRequester',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.rejectFollowRequest(req, res);
  }
);

/**
 * @route           DELETE api/follow/removereject/:idOfRequester
 * @description     Delete user from reject list
 * @access          Private
 */
followRouter.delete(
  '/removereject/:idOfRequester',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.deleteUserFromRejectList(req, res);
  }
);

/**
 * @route           POST api/follow/blockuser/:idOfBlockedUser
 * @description     Block a follower or a user
 * @access          Private
 */
followRouter.post(
  '/blockuser/:idOfBlockedUser',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.blockFollower(req, res);
  }
);

followRouter.delete(
  '/removeblock/:idOfBlockedUser',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.removeBlock(req, res);
  }
);

/**
 * @route           POST api/follow
 * @description     Send follow request to a user, this will send follow request or start follow or will remove follow request or will unfollow, id is the id of user whicu auth user sends follow request
 * @access          Private
 */
followRouter.post(
  '/:idToFollow',
  httpsMiddleware,
  authMiddleware,
  (req, res) => {
    FollowController.followUnfollow(req, res);
  }
);
