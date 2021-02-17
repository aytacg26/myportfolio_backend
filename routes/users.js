import express from 'express';

export const usersRouter = express.Router();

/**
 * @route           GET api/users
 * @description     Test Route
 * @access          Public
 */

usersRouter.get('/', (req, res) => {
  res.send('Users Route');
});
