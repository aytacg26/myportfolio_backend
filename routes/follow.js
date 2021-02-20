import express from 'express';
import { check, validationResult } from 'express-validator';
import authMiddleware from '../Middleware/authMiddleware.js';
import FollowController from '../Controllers/FollowController/FollowController.js';

export const followRouter = express.Router();

/**
 * @route           POST api/follow
 * @description     Send follow request to a user, this will send follow request or start follow or will remove follow request or will unfollow
 * @access          Private
 */
followRouter.post('/:id/:idToFollow', authMiddleware, (req, res) => {
  FollowController.followUnfollow(req, res);
});
