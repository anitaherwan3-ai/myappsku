const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'pcc-sumsel-super-secret-key';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

module.exports = { authenticate, SECRET_KEY };