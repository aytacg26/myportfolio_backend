import express from 'express';

export const postsRouter = express.Router();

/**
 * @route           GET api/posts
 * @description     Test Route
 * @access          Public
 */

postsRouter.get('/', (req, res) => {
  res.send('Posts Route');
});
