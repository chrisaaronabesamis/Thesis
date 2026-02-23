import jwt from 'jsonwebtoken';

/**
 * Authentication for logged-in users
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next 
 */
export default function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      'success': false,
      'message': 'Unauthenticated user',
    });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.API_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        'success': false,
        'message': 'Invalid token',
      });
    }

    res.locals.userId = decoded?.id;
    res.locals.authenticated = true;
    next();
  });
}
