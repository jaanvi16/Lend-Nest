const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from request headers
 * Adds the decoded user info to req.user
 * 
 * Usage: app.use(protect) or router.get('/protected', protect, controller)
 */
const protect = async (req, res, next) => {
  let token;

  // Look for token in Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user info to request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { protect };
