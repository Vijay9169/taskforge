import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'taskforge_secret_key_2026';

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No authentication token, access denied' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Token format invalid, access denied' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    // Verified object: { id: '...' }
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed, authorization denied' });
  }
};

export default auth;