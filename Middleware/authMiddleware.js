import jwt from 'jsonwebtoken';
import config from 'config';
import { errorMessage } from '../messages/messages.js';

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return errorMessage(res, 401, 'No token found, Access is denied');
  }

  try {
    console.log('In auth middleware');
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (error) {
    return errorMessage(
      res,
      401,
      'Unauthorized : Access is denied due to invalid token'
    );
  }
};

export default authMiddleware;
