import { errorMessage } from '../messages/messages.js';

const httpsMiddleware = (req, res, next) => {
  const isHttps = req.protocol === 'https';

  if (!isHttps) {
    return errorMessage(res, 401, 'Only https connections are acceptable');
  }

  next();
};

export default httpsMiddleware;

/**
 * 
 *   console.log(req.protocol);
  console.log(req.hostname);
  console.log(req.baseUrl);
 * 
 * 
 */
