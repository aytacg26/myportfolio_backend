import express from 'express';

export const profilesRouter = express.Router();

/**
 * @route           GET api/profile
 * @description     Test Route
 * @access          Public
 */

profilesRouter.get('/', (req, res) => {
  res.send('Profile Route');
});
