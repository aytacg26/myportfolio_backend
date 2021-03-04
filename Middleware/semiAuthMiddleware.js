import jwt from 'jsonwebtoken';
import config from 'config';
import { errorMessage } from '../messages/messages.js';

//This middleware will be used in some cases to prevent some users from entering complete data
const semiAuthMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    req.isAuthUser = false;
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    req.isAuthUser = true;
    next();
  } catch (error) {
    //If a user uses an fake token, we must stop him/her to enter in any case.
    return errorMessage(
      res,
      401,
      'Unauthorized : Access is denied due to invalid token'
    );
  }
};

export default semiAuthMiddleware;
